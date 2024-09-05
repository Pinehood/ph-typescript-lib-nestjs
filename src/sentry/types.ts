import { ConsoleLoggerOptions, ModuleMetadata, Type } from "@nestjs/common";
import { Integration, Options, SeverityLevel } from "@sentry/types";

export const SENTRY_MODULE_OPTIONS = Symbol("SentryModuleOptions");
export const SENTRY_TOKEN = Symbol("SentryToken");

export interface SentryCloseOptions {
  enabled: boolean;
  timeout?: number;
}

export type SentryModuleOptions = Omit<Options, "integrations"> & {
  integrations?: Integration[];
  close?: SentryCloseOptions;
} & ConsoleLoggerOptions;

export interface SentryOptionsFactory {
  createSentryModuleOptions():
    | Promise<SentryModuleOptions>
    | SentryModuleOptions;
}

export interface SentryModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  inject?: any[];
  useClass?: Type<SentryOptionsFactory>;
  useExisting?: Type<SentryOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<SentryModuleOptions> | SentryModuleOptions;
}

export type SentryTransaction = boolean | "path" | "methodPath" | "handler";

export interface SentryFilterFunction {
  (exception: any): boolean;
}

export interface SentryInterceptorOptionsFilter {
  type: any;
  filter?: SentryFilterFunction;
}

export interface SentryInterceptorOptions {
  filters?: SentryInterceptorOptionsFilter[];
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  fingerprint?: string[];
  level?: SeverityLevel;
  request?: boolean;
  serverName?: boolean;
  transaction?: boolean | "path" | "methodPath" | "handler";
  user?: boolean | string[];
  version?: boolean;
}