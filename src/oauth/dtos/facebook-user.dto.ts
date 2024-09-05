import { OAuthUserDto } from "@/dtos/oauth-user.dto";

export class FacebookUserDto extends OAuthUserDto {
  facebookId: string;
}
