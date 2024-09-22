import { InternalServerErrorException } from "@nestjs/common";
import { HttpException } from "@nestjs/common/exceptions";
import { Request } from "express";
import { NumberConstants } from "../static";

export const ImageFileFilter = (
  _req: Request,
  file: any,
  callback: (exception: HttpException | null, success: boolean) => void,
): void => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
    return callback(
      new InternalServerErrorException("jpg jpeg png gif svg"),
      false,
    );
  }
  if (file.size > NumberConstants.MAX_FILE_SIZE) {
    return callback(
      new InternalServerErrorException(
        `Max. ${NumberConstants.MAX_FILE_SIZE}MB`,
      ),
      false,
    );
  }
  callback(null, true);
};
