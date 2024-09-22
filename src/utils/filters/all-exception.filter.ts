import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ExceptionResponseDto } from "../static";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error | any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;
    const cause = exception.stack;
    const responseBody = {
      status,
      timestamp: new Date().getTime(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
      cause,
    } as ExceptionResponseDto;
    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
