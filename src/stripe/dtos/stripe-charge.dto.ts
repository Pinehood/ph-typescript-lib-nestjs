import { PaymentMetadataDto } from "./payment-metadata.dto";

export class StripeChargeDto {
  id: string;
  object: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  balance_transaction: string;
  billing_details: {
    address: {
      city: string;
      country: string;
      line1: string;
      line2: string;
      postal_code: string;
      state: string;
    };
    email: string;
    name: string;
    phone: string;
  };
  calculated_statement_descriptor: string;
  captured: boolean;
  created: number;
  currency: string;
  customer: string;
  description: string;
  destination: string;
  dispute: string;
  disputed: boolean;
  failure_balance_transaction: string;
  failure_code: string;
  failure_message: string;
  fraud_details: any;
  invoice: any;
  livemode: boolean;
  metadata: PaymentMetadataDto;
  on_behalf_of: any;
  order: any;
  outcome: {
    network_status: string;
    reason: string;
    risk_level: string;
    risk_score: number;
    seller_message: string;
    type: string;
  };
  paid: boolean;
  payment_intent: string;
  payment_method: string;
  payment_method_details: {
    card: {
      brand: string;
      checks: {
        address_line1_check: string;
        address_postal_code_check: string;
        cvc_check: string;
      };
      country: string;
      exp_month: number;
      exp_year: number;
      fingerprint: string;
      funding: string;
      installments: any;
      last4: string;
      mandate: any;
      network: string;
      three_d_secure: any;
      wallet: any;
    };
    type: "card";
  };
  receipt_email: string;
  receipt_number: any;
  receipt_url: string;
  refunded: boolean;
  refunds: {
    object: string;
    data: any[];
    has_more: boolean;
    url: string;
  };
  review: any;
  shipping: any;
  source: any;
  source_transfer: any;
  statement_descriptor: string;
  statement_descriptor_suffix: string;
  status: string;
  transfer_data: any;
  transfer_group: any;
}
