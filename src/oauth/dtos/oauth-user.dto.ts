export class OAuthUserDto {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  accessToken: string;
  refreshToken?: string | null;
}
