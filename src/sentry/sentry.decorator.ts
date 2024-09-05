import { Inject } from "@nestjs/common";

export const SENTRY_MODULE_OPTIONS = Symbol("SentryModuleOptions");
export const SENTRY_TOKEN = Symbol("SentryToken");

export const makeInjectableDecorator =
  (token: string | symbol): (() => ParameterDecorator) =>
  () =>
    Inject(token);
export const InjectSentry = makeInjectableDecorator(SENTRY_TOKEN);
export const InjectSentryModuleConfig = makeInjectableDecorator(
  SENTRY_MODULE_OPTIONS,
);
