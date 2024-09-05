import {
  BadRequestException,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from "@nestjs/common";

@Injectable()
export class ParseIntPipe implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    const { metatype } = metadata;
    if (!metatype) {
      return -1;
    }
    const val = parseInt(value, 10);
    if (Number.isNaN(val)) {
      throw new BadRequestException("Validation failed");
    }
    return val;
  }
}
