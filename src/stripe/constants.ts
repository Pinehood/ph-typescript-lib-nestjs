export enum StripeConstants {
  TEST_MODE = "test",
  LIVE_MODE = "live",
  API_VERSION = "2024-06-20",
  DASHBOARD_SANDBOX = "https://dashboard.stripe.com/test/payments/",
  DASHBOARD_PRODUCTION = "https://dashboard.stripe.com/live/payments/",
  HEADER_SIGNATURE = "stripe-signature",
  CHARGE_OKAY = "charge.succeeded",
  CHARGE_FAILED = "charge.failed",
  CHARGE_REFUNDED = "charge.refunded",
  PUBLIC_API_KEY_PREFIX = "pk_",
  SECRET_API_KEY_PREFIX = "sk_",
  RESTRICTED_API_KEY_PREFIX = "rk_",
  FEE_TYPE = "stripe_fee",
  SUCCEEDED = "succeeded",
  CANCELED = "canceled",
  ENABLED = "enabled",
}
