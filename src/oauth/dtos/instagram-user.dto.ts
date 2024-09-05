import { OAuthUserDto } from "@/dtos/oauth-user.dto";

export class InstagramUserDto extends OAuthUserDto {
  instagramId: string;
}
