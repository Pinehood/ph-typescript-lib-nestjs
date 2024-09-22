import { Hash, createHash, randomBytes } from "crypto";
import { CommonConstants, NumberConstants } from "../static";

export function generateSalt(): string {
  return randomBytes(NumberConstants.SALT_SIZE).toString(CommonConstants.HEX);
}

export function generatePinCode(): number {
  const pin = Math.floor(100000 + Math.random() * 999999);
  if (pin >= 1000000) {
    return Math.floor(pin / 10);
  } else {
    return Math.floor(pin);
  }
}

export function saltAndHashPassword(password: string, salt: string): string {
  try {
    const hash: Hash = createHash(CommonConstants.SHA);
    const saltedPassword = `${salt}-${password}`;
    hash.update(saltedPassword, CommonConstants.UTF_8);
    hash.copy();
    const hashedPassword: string = hash.digest(CommonConstants.HEX);
    return hashedPassword;
  } catch (error: any) {
    this.logger.error(error);
    return "";
  }
}
