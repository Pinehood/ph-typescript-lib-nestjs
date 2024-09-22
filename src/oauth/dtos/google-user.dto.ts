import { OAuthUserDto } from "./oauth-user.dto";

export class GoogleUserDto extends OAuthUserDto {
  googleId: string;
}
