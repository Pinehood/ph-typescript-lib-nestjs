import { Module, DynamicModule } from "@nestjs/common";
import { SentryModuleAsyncOptions, SentryModuleOptions } from "@/types";
import { SentryCoreModule } from "@/sentry-core.module";

@Module({})
export class SentryModule {
  public static forRoot(options: SentryModuleOptions): DynamicModule {
    return {
      module: SentryModule,
      imports: [SentryCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: SentryModuleAsyncOptions): DynamicModule {
    return {
      module: SentryModule,
      imports: [SentryCoreModule.forRootAsync(options)],
    };
  }
}
