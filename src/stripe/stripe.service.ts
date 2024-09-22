import { Injectable, RawBodyRequest } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import Stripe from "stripe";
import { Request } from "express";
import { StripeConstants } from "./constants";
import {
  PaymentMetadataDto,
  StripeChargeDto,
  StripePaymentIntentDataDto,
  StripeWebhookDataDto,
} from "./dtos";

@Injectable()
export class StripeService {
  constructor(
    @InjectPinoLogger(StripeService.name)
    private readonly logger: PinoLogger,
  ) {}

  async testMerchantsService(
    publicApiKey: string,
    secretApiKey: string,
  ): Promise<boolean> {
    return await new Promise(async (resolve) => {
      this.testService(publicApiKey, secretApiKey, async (success: boolean) => {
        resolve(success);
      });
    });
  }

  async createWebhook(
    secretApiKey: string,
    endpoint: string,
  ): Promise<boolean> {
    try {
      const client = new Stripe(secretApiKey, {
        apiVersion: StripeConstants.API_VERSION,
      });
      const webhookEndpoint = await client.webhookEndpoints.create({
        url: endpoint,
        enabled_events: [
          "charge.failed",
          "charge.pending",
          "charge.refunded",
          "charge.succeeded",
          "charge.updated",
          "charge.refund.updated",
          "payment_intent.canceled",
          "payment_intent.created",
          "payment_intent.payment_failed",
          "payment_intent.succeeded",
        ],
      });
      const result =
        webhookEndpoint && webhookEndpoint.status === StripeConstants.ENABLED;
      if (result) {
        this.logger.info(
          "Created a Stripe webhook, ID '%d', secret '%s'",
          webhookEndpoint.id,
          webhookEndpoint.secret,
        );
        return true;
      } else {
        this.logger.warn("Failed to create a Stripe webhook");
        return false;
      }
    } catch (error: any) {
      this.logger.error(error);
      return false;
    }
  }

  async deleteWebhook(secretApiKey: string, webhookId: string): Promise<void> {
    try {
      const client = new Stripe(secretApiKey, {
        apiVersion: StripeConstants.API_VERSION,
      });
      const result = await client.webhookEndpoints.del(webhookId);
      this.logger.info(
        "Stripe webhook '%s' deletion successful: %s",
        webhookId,
        result.deleted,
      );
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  async createOrUpdatePaymentIntent(
    secretApiKey: string,
    webhookSecret: string,
    amount: number,
    metadata: PaymentMetadataDto,
    paymentIntentId?: string,
  ): Promise<StripePaymentIntentDataDto> {
    try {
      const client = new Stripe(secretApiKey, {
        apiVersion: StripeConstants.API_VERSION,
      });
      const min = 0.5;
      const max = 1000;
      const amountF = parseFloat(amount.toString());
      if (amountF < min || amountF > max) {
        return {
          created: false,
          id: "",
          clientSecret: "",
          returnUrl: "",
        };
      }

      let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
      if (paymentIntentId) {
        paymentIntent = await client.paymentIntents.update(paymentIntentId, {
          amount: amount * 100,
          currency: "usd",
          metadata: { ...metadata, secretApiKey, webhookSecret },
          receipt_email: metadata.senderEmail,
        });
      } else {
        paymentIntent = await client.paymentIntents.create({
          amount: amount * 100,
          currency: "usd",
          metadata: { ...metadata },
          payment_method_types: ["card"],
          receipt_email: metadata.senderEmail,
        });
      }
      return {
        created: true,
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        returnUrl: `/whatever-completion-screen`,
      };
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  async cancelPaymentIntent(
    secretApiKey: string,
    paymentIntentId: string,
  ): Promise<boolean> {
    try {
      const client = new Stripe(secretApiKey, {
        apiVersion: StripeConstants.API_VERSION,
      });
      const paymentIntent = await client.paymentIntents.cancel(paymentIntentId);
      return paymentIntent.status === StripeConstants.CANCELED;
    } catch (error: any) {
      this.logger.error(error);
      return false;
    }
  }

  async getPaymentIntentFee(
    secretApiKey: string,
    paymentIntentId: string,
  ): Promise<number> {
    try {
      const client = new Stripe(secretApiKey, {
        apiVersion: StripeConstants.API_VERSION,
      });
      const paymentIntent = await client.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["charges.data.balance_transaction"],
        },
      );
      if (!paymentIntent || paymentIntent.status != StripeConstants.SUCCEEDED)
        return 0;
      const charge = paymentIntent.latest_charge as Stripe.Charge;
      const balanceTransaction =
        charge.balance_transaction as Stripe.BalanceTransaction;
      const feeDetails = balanceTransaction.fee_details;
      let sum = 0;
      if (feeDetails) {
        feeDetails.forEach((fd: any) => {
          if (fd.type === StripeConstants.FEE_TYPE) {
            sum += fd.amount / 100;
          }
        });
      }
      return sum;
    } catch (error: any) {
      this.logger.error(error);
      return 0;
    }
  }

  async constructEvent(
    secretApiKey: string,
    signature: string,
    secret: string,
    body: string | Buffer,
  ): Promise<StripeWebhookDataDto> {
    try {
      const client = new Stripe(secretApiKey, {
        apiVersion: StripeConstants.API_VERSION,
      });
      return (await client.webhooks.constructEventAsync(
        body,
        signature,
        secret,
      )) as unknown as StripeWebhookDataDto;
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  async performStripeTransaction(
    request: RawBodyRequest<Request>,
  ): Promise<void> {
    try {
      const signature = request.headers[
        StripeConstants.HEADER_SIGNATURE
      ] as string;
      const body = JSON.parse(request.rawBody.toString("utf8")) as any;
      const secret = body.webhookSecret;
      const secretApiKey = body.secretApiKey;
      delete body.secretApiKey;
      if (signature && secret) {
        const event = await this.constructEvent(
          secretApiKey,
          signature,
          secret,
          JSON.stringify(body),
        );
        if (!event || !event.type) {
          this.logger.warn("Failed to securely deconstruct Stripe event");
          return;
        }
        if (
          event.type === StripeConstants.CHARGE_FAILED ||
          event.type === StripeConstants.CHARGE_OKAY
        ) {
          const chargeEvent = event.data.object as StripeChargeDto;
          const amountCaptured = chargeEvent.amount_captured / 100;
          if (event.type === StripeConstants.CHARGE_OKAY) {
            this.logger.info(
              "Successfully charged a credit card for amount '%d' USD",
              amountCaptured,
            );
          } else {
            this.logger.error(
              "Something went wrong with charging a card for amount '%d' USD, elevant external reference IDs are '%s' and '%s'",
              amountCaptured,
              chargeEvent.id,
              chargeEvent.payment_intent,
            );
          }
        } else if (event.type === StripeConstants.CHARGE_REFUNDED) {
          const chargeEvent = event.data.object as StripeChargeDto;
          const eventMetadata = chargeEvent.metadata;
          this.logger.info(
            "An charge '%s' has been successfully refunded', relevant external reference IDs are '%s' and '%s'",
            eventMetadata.aliasId,
            chargeEvent.id,
            chargeEvent.payment_intent,
          );
        } else {
          this.logger.info("Event type '%s'", event.type);
        }
      }
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private testService(
    publicApiKey: string,
    secretApiKey: string,
    callback: (success: boolean) => void,
    isLive?: boolean,
  ): void {
    try {
      if (
        publicApiKey !== secretApiKey &&
        publicApiKey.startsWith(StripeConstants.PUBLIC_API_KEY_PREFIX) &&
        (secretApiKey.startsWith(StripeConstants.SECRET_API_KEY_PREFIX) ||
          secretApiKey.startsWith(StripeConstants.RESTRICTED_API_KEY_PREFIX))
      ) {
        if (
          isLive === true &&
          (publicApiKey.includes(StripeConstants.TEST_MODE) ||
            secretApiKey.includes(StripeConstants.TEST_MODE))
        ) {
          callback(false);
          return;
        }
        const client = new Stripe(secretApiKey, {
          apiVersion: StripeConstants.API_VERSION,
        });
        client.accounts
          .list({ limit: 1 })
          .then(() => callback(true))
          .catch(() => callback(false));
      }
    } catch {
      callback(false);
    }
  }
}
