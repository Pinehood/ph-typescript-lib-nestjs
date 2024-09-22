import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { google } from "googleapis";
import { TokenInfo, TokenPayload } from "google-auth-library";
import { Axios } from "axios";
import { FacebookUserDto, GoogleUserDto, InstagramUserDto } from "./dtos";
import { OAuthUrls, OAuthUrlTokens } from "./constants";

@Injectable()
export class OAuthService {
  private axios = new Axios({});

  constructor(
    @InjectPinoLogger(OAuthService.name) private readonly logger: PinoLogger,
  ) {}

  async googleLoginToken(
    id: string,
    secret: string,
    token: string,
    mode: "id" | "access" = "id",
  ): Promise<GoogleUserDto> {
    try {
      const oauthClient = new google.auth.OAuth2(id, secret);
      if (!oauthClient) return null;

      let tokenInfo: TokenInfo | TokenPayload = null;
      if (mode === "id") {
        const idToken = await oauthClient.verifyIdToken({ idToken: token });
        if (!idToken) return null;
        tokenInfo = idToken.getPayload();
      } else if (mode === "access") {
        tokenInfo = await oauthClient.getTokenInfo(token);
      } else {
        return null;
      }

      if (!tokenInfo) return null;

      this.logger.info(
        "Successful Google OAuth token verification for email '%s'",
        tokenInfo.email,
      );

      const googleUser: GoogleUserDto = {
        id: null,
        googleId: tokenInfo.sub,
        email: tokenInfo.email,
        accessToken: token,
      };
      return googleUser;
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  async facebookLoginToken(
    id: string,
    secret: string,
    token: string,
  ): Promise<FacebookUserDto> {
    try {
      const appUrl = OAuthUrls.FACEBOOK_GET_TOKEN_APP.replace(
        OAuthUrlTokens.ACCESS_TOKEN,
        token,
      );

      const appResponse = await this.axios.get(appUrl);
      if (appResponse.status === 200 && appResponse.data) {
        const { id: appId } = appResponse.data;
        if (id !== appId) {
          this.logger.warn(
            "A user from IP tried to use Facebook access token '%s' with incorrect APP_ID",
            token,
          );
          return null;
        }
      } else {
        this.logger.warn(
          "Failed to verify APP_ID of a Facebook access token '%s'",
          token,
        );
        return null;
      }

      const verifyUrl = OAuthUrls.FACEBOOK_VERIFY_TOKEN.replace(
        OAuthUrlTokens.ACCESS_TOKEN,
        token,
      )
        .replace(OAuthUrlTokens.CLIENT_ID, id)
        .replace(OAuthUrlTokens.CLIENT_SECRET, secret);
      const verifyResponse = await this.axios.get(verifyUrl);
      if (verifyResponse.status === 200 && verifyResponse.data) {
        const { id, email, name } = verifyResponse.data;
        this.logger.info(
          "Successful Facebook OAuth token verification for email '%s'",
          email,
        );

        let firstName = "";
        let lastName = "";
        if (name) {
          if (name.includes(" ")) {
            const split = name.split(" ");
            firstName = split[0];
            lastName = split[1];
          } else {
            firstName = name.toString();
          }
        }

        const facebookUser: FacebookUserDto = {
          id: null,
          facebookId: id,
          email,
          firstName,
          lastName,
          accessToken: token,
        };
        if (!facebookUser) return null;

        return facebookUser;
      } else {
        this.logger.warn(
          "Failed to verify Facebook access token '%s' of a user",
          token,
        );
      }
    } catch (error: any) {
      this.logger.error(error);
    }
    return null;
  }

  async instagramLoginToken(
    id: string,
    secret: string,
    token: string,
  ): Promise<InstagramUserDto> {
    try {
      const url = OAuthUrls.INSTAGRAM_VERIFY_TOKEN.replace(
        OAuthUrlTokens.ACCESS_TOKEN,
        token,
      )
        .replace(OAuthUrlTokens.CLIENT_ID, id)
        .replace(OAuthUrlTokens.CLIENT_SECRET, secret);
      const response = await this.axios.get(url);
      if (response.status === 200 && response.data) {
        const { id, username } = response.data;
        this.logger.info(
          "Successful Instagram OAuth token verification for username '%s'",
          username,
        );

        let firstName = "";
        let lastName = "";
        if (username.includes(" ")) {
          const split = username.split(" ");
          firstName = split[0];
          lastName = split[1];
        } else {
          firstName = username;
        }

        const instagramUser: InstagramUserDto = {
          id: null,
          instagramId: id,
          email: username.trim().replace(/ /g, "") + "@instagram.com",
          firstName,
          lastName,
          accessToken: token,
        };
        if (!instagramUser) return null;

        return instagramUser;
      } else {
        this.logger.warn(
          "Failed to verify Instagram access token '%s' of a user",
          token,
        );
      }
    } catch (error: any) {
      this.logger.error(error);
    }
    return null;
  }
}
