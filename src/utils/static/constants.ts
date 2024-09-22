export enum CommonConstants {
  TRUE_STRING = "true",
  ENCRYPTION_ALGORITHM = "aes-192-cbc",
  UTF8 = "utf8",
  UTF_8 = "utf-8",
  HEX = "hex",
  SHA = "sha512",
  JWT = "jwt",
  BIN = "binary",
  B64 = "base64",
}

export enum NumberConstants {
  SALT_SIZE = 32,
  SCRYPT_KEYLEN = 24,
  IV_SIZE = 16,
  ONE_MB_KB = 1024 * 1024,
  MAX_FILE_SIZE = 50 * ONE_MB_KB,
  ONE_DAY_MS = 24 * 60 * 60 * 1000,
  MS_365_DAYS = 365 * ONE_DAY_MS,
  MS_14_DAYS = 14 * ONE_DAY_MS,
  TEN_SECS_MS = 10000,
}

export enum EncryptionType {
  TOKEN = 1,
  API_INFO = 2,
}
