import { Module, Global, Provider, Type, DynamicModule } from "@nestjs/common";
import {
  SENTRY_MODULE_OPTIONS,
  SENTRY_TOKEN,
  SentryModuleAsyncOptions,
  SentryModuleOptions,
  SentryOptionsFactory,
} from "@/types";
import { SentryService } from "@/sentry.service";

function createSentryProviders(options: SentryModuleOptions): Provider {
  return {
    provide: SENTRY_TOKEN,
    useValue: new SentryService(options),
  };
}

@Global()
@Module({})
export class SentryCoreModule {
  public static forRoot(options: SentryModuleOptions): DynamicModule {
    const provider = createSentryProviders(options);
    return {
      exports: [provider, SentryService],
      module: SentryCoreModule,
      providers: [provider, SentryService],
    };
  }

  public static forRootAsync(options: SentryModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      inject: [SENTRY_MODULE_OPTIONS],
      provide: SENTRY_TOKEN,
      useFactory: (options: SentryModuleOptions) => new SentryService(options),
    };
    return {
      exports: [provider, SentryService],
      imports: options.imports,
      module: SentryCoreModule,
      providers: [
        ...this.createAsyncProviders(options),
        provider,
        SentryService,
      ],
    };
  }

  private static createAsyncProviders(
    options: SentryModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<SentryOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: SentryModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: SENTRY_MODULE_OPTIONS,
        useFactory: options.useFactory,
      };
    }
    const inject = [
      (options.useClass || options.useExisting) as Type<SentryOptionsFactory>,
    ];
    return {
      provide: SENTRY_MODULE_OPTIONS,
      useFactory: async (optionsFactory: SentryOptionsFactory) =>
        await optionsFactory.createSentryModuleOptions(),
      inject,
    };
  }
}
