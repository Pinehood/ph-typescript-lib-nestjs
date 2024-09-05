import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import * as SendGrid from "@sendgrid/mail";

export type SendGridAttachment = {
  filename: string;
  content: string;
  type: string;
};

@Injectable()
export class MailService {
  constructor(
    @InjectPinoLogger(MailService.name) private readonly logger: PinoLogger,
  ) {}

  async sendMail(
    key: string,
    from: string,
    receiver: string,
    subject: string,
    content: any,
    attachments?: SendGridAttachment[],
  ): Promise<boolean> {
    try {
      SendGrid.setApiKey(key);
      const response: Promise<boolean> = new Promise((resolve) => {
        SendGrid.send({
          from: from,
          html: content,
          to: receiver,
          subject,
          attachments,
        })
          .then((result) => {
            this.logger.info(
              "SendGrid sent mail info: '%s'",
              JSON.stringify(result),
            );
            resolve(true);
          })
          .catch((error: any) => {
            this.logger.error(error);
            resolve(false);
          });
      });
      const finalResult = await response;
      this.logger.info("Mail sent to '%s'", receiver);
      return finalResult;
    } catch (error: any) {
      this.logger.error(error);
      return false;
    }
  }
}
