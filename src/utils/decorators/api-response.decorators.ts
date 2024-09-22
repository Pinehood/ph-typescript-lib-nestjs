import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ExceptionResponseDto } from "../static";

export function ApiResponseBadRequest() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: "Bad Request",
      type: ExceptionResponseDto,
    }),
  );
}

export function ApiResponseUnauthorized() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: "Unauthorized",
      type: ExceptionResponseDto,
    }),
  );
}

export function ApiResponseForbidden() {
  return applyDecorators(
    ApiResponse({
      status: 403,
      description: "Forbidden",
      type: ExceptionResponseDto,
    }),
  );
}

export function ApiResponseNotFound() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: "Not Found",
      type: ExceptionResponseDto,
    }),
  );
}

export function ApiResponseTooManyRequests() {
  return applyDecorators(
    ApiResponse({
      status: 429,
      description: "Too Many Requests",
      type: ExceptionResponseDto,
    }),
  );
}

export function ApiResponseInternalServerError() {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
      type: ExceptionResponseDto,
    }),
  );
}
