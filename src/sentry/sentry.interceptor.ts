import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {
  HttpArgumentsHost,
  WsArgumentsHost,
  RpcArgumentsHost,
  ContextType,
} from "@nestjs/common/interfaces";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Scope } from "@sentry/core";
import { Handlers } from "@sentry/node";
import { SentryService } from "@/sentry.service";
import {
  SentryInterceptorOptions,
  SentryInterceptorOptionsFilter,
} from "@/types";

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  protected readonly client: SentryService =
    SentryService.SentryServiceInstance();
  constructor(private readonly options?: SentryInterceptorOptions) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(null, (exception: HttpException) => {
        if (this.shouldReport(exception)) {
          this.client.instance().withScope((scope) => {
            return this.captureException(context, scope, exception);
          });
        }
      }),
    );
  }

  protected captureException(
    context: ExecutionContext,
    scope: Scope,
    exception: HttpException,
  ) {
    switch (context.getType<ContextType>()) {
      case "http":
        return this.captureHttpException(
          scope,
          context.switchToHttp(),
          exception,
        );
      case "rpc":
        return this.captureRpcException(
          scope,
          context.switchToRpc(),
          exception,
        );
      case "ws":
        return this.captureWsException(scope, context.switchToWs(), exception);
    }
  }

  private captureHttpException(
    scope: Scope,
    http: HttpArgumentsHost,
    exception: HttpException,
  ): void {
    const data = Handlers.parseRequest(
      <any>{},
      http.getRequest(),
      this.options,
    );
    scope.setExtra("req", data.request);
    if (data.extra) scope.setExtras(data.extra);
    if (data.user) scope.setUser(data.user);
    this.client.instance().captureException(exception);
  }

  private captureRpcException(
    scope: Scope,
    rpc: RpcArgumentsHost,
    exception: any,
  ): void {
    scope.setExtra("rpc_data", rpc.getData());
    this.client.instance().captureException(exception);
  }

  private captureWsException(
    scope: Scope,
    ws: WsArgumentsHost,
    exception: any,
  ): void {
    scope.setExtra("ws_client", ws.getClient());
    scope.setExtra("ws_data", ws.getData());
    this.client.instance().captureException(exception);
  }

  private shouldReport(exception: any) {
    if (this.options && !this.options.filters) return true;
    if (this.options) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const opts: SentryInterceptorOptions = this.options as {};
      if (opts.filters) {
        const filters: SentryInterceptorOptionsFilter[] = opts.filters;
        return filters.some(({ type, filter }) => {
          return !(exception instanceof type && (!filter || filter(exception)));
        });
      }
    } else {
      return true;
    }
  }
}
