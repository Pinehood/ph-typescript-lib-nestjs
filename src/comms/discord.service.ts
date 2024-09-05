import { Injectable } from "@nestjs/common";
import { Webhook } from "discord-webhook-node";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Injectable()
export class DiscordService {
  constructor(
    @InjectPinoLogger(DiscordService.name)
    private readonly logger: PinoLogger,
  ) {}

  async sendError(
    url: string,
    title: string,
    fieldName?: string,
    fieldValue?: string,
    inline?: boolean,
  ) {
    try {
      await new Webhook(url).error(
        title,
        fieldName,
        fieldValue?.substring(0, 1024),
        inline,
      );
    } catch (error) {
      this.logger.error(
        "Error occurred while trying to send a Discord error notification.",
        error,
      );
    }
  }

  async sendInfo(
    url: string,
    title: string,
    fieldName?: string,
    fieldValue?: string,
    inline?: boolean,
  ) {
    try {
      await new Webhook(url).info(
        title,
        fieldName,
        fieldValue?.substring(0, 1024),
        inline,
      );
    } catch (error) {
      this.logger.error(
        "Error occurred while trying to send Discord info notification.",
        error,
      );
    }
  }
}
