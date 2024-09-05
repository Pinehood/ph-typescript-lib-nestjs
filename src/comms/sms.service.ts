import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Twilio } from "twilio";

@Injectable()
export class SmsService {
  constructor(
    @InjectPinoLogger(SmsService.name) private readonly logger: PinoLogger,
  ) {}

  async sendSms(
    sid: string,
    key: string,
    from: string,
    to: string,
    content: string,
  ): Promise<boolean> {
    try {
      const message = await new Twilio(sid, key).messages.create({
        from,
        to,
        body: content,
      });

      this.logger.info(
        "SMS sent to '%s', message info: '%s'",
        to,
        JSON.stringify(message),
      );
      return true;
    } catch (error: any) {
      this.logger.error(error);
      return false;
    }
  }
}
