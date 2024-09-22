import { OAuthUserDto } from "./oauth-user.dto";

export class FacebookUserDto extends OAuthUserDto {
  facebookId: string;
}
