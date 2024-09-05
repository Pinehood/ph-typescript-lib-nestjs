export class ExceptionResponseDto {
  status: number;
  timestamp: number;
  path: string;
  message: string;
  cause?: object | null;
}
