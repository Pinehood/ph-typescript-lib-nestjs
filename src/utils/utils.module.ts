import { Module } from "@nestjs/common";
import { EncryptionService } from "./services";

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class UtilsModule {}
