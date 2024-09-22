import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ExceptionResponseDto } from "../static";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;
    const cause = exception.cause;
    response.status(status).json({
      status,
      timestamp: new Date().getTime(),
      path: request.url,
      message,
      cause,
    } as ExceptionResponseDto);
  }
}
