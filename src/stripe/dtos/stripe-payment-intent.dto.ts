import { PaymentMetadataDto } from "./payment-metadata.dto";

export class StripePaymentIntentDto {
  id: string;
  object: string;
  amount: number;
  client_secret: string;
  created: number;
  currency: string;
  flow: string;
  livemode: boolean;
  metadata: PaymentMetadataDto;
  owner: {
    adress: string;
    email: string;
    name: string;
    phone: string;
    verified_address: string;
    verified_email: string;
    verified_name: string;
    verified_phone: string;
  };
  redirect: {
    failure_reason: string;
    return_url: string;
    status: string;
    url: string;
  };
  sofort: {
    country: string;
    bank_code: string;
    bank_name: string;
    bic: string;
    iban_last4: string;
    statement_descriptor: string;
    preferred_language: string;
  };
  statement_descriptor: string;
  status: string;
  type: string;
  usage: string;
}
