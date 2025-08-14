import { Injectable } from "@nestjs/common";
import { Cipheriv, createCipheriv, createDecipheriv, scryptSync } from "crypto";
import {
  CommonConstants,
  EncryptionDetails,
  EncryptionType,
  NumberConstants,
} from "../static";

@Injectable()
export class EncryptionService {
  private tokenEncryption: EncryptionDetails;
  private apiInfoEncryption: EncryptionDetails;

  constructor() {}

  encrypt(text: string, type?: EncryptionType): string {
    try {
      const cipher = this.createCipher(type);
      let encrypted = cipher.update(
        text,
        CommonConstants.UTF8,
        CommonConstants.HEX,
      );
      encrypted += cipher.final(CommonConstants.HEX);
      return encrypted;
    } catch (error: any) {
      return "";
    }
  }

  decrypt(text: string, type?: EncryptionType): string {
    try {
      const decipher = this.createDecipher(type);
      let decrypted = decipher.update(
        text,
        CommonConstants.HEX,
        CommonConstants.UTF8,
      );
      decrypted += decipher.final(CommonConstants.UTF8);
      return decrypted;
    } catch (error: any) {
      return "";
    }
  }

  setEncryptionDetails(
    type: EncryptionType,
    secret: string,
    salt: string,
  ): EncryptionDetails {
    const key: Buffer = scryptSync(secret, salt, NumberConstants.SCRYPT_KEYLEN);
    const cfg: EncryptionDetails = {
      algorithm: CommonConstants.ENCRYPTION_ALGORITHM,
      iv: Buffer.alloc(NumberConstants.IV_SIZE, 0),
      secret,
      key,
    };
    if (type === EncryptionType.TOKEN) {
      this.tokenEncryption = cfg;
    } else if (type === EncryptionType.API_INFO) {
      this.apiInfoEncryption = cfg;
    }
    return cfg;
  }

  private createCipher(type?: EncryptionType): Cipheriv {
    if (!type || type === EncryptionType.TOKEN) {
      return createCipheriv(
        this.tokenEncryption.algorithm,
        this.tokenEncryption.key,
        this.tokenEncryption.iv,
      );
    } else if (type === EncryptionType.API_INFO) {
      return createCipheriv(
        this.apiInfoEncryption.algorithm,
        this.apiInfoEncryption.key,
        this.apiInfoEncryption.iv,
      );
    }
  }

  private createDecipher(type?: EncryptionType): Cipheriv {
    if (!type || type === EncryptionType.TOKEN) {
      return createDecipheriv(
        this.tokenEncryption.algorithm,
        this.tokenEncryption.key,
        this.tokenEncryption.iv,
      );
    } else if (type === EncryptionType.API_INFO) {
      return createDecipheriv(
        this.apiInfoEncryption.algorithm,
        this.apiInfoEncryption.key,
        this.apiInfoEncryption.iv,
      );
    }
  }
}
