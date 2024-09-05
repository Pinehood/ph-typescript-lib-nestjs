import { OAuthUserDto } from "@/dtos/oauth-user.dto";

export class GoogleUserDto extends OAuthUserDto {
  googleId: string;
}
