export type EncryptionDetails = {
  secret: string;
  algorithm: string;
  key: Buffer;
  iv: Buffer;
};
