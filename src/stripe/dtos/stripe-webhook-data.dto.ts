import { StripeChargeDto } from "./stripe-charge.dto";
import { StripePaymentIntentDto } from "./stripe-payment-intent.dto";

export class StripeWebhookDataDto {
  id: string;
  type: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: StripePaymentIntentDto | StripeChargeDto;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
}
