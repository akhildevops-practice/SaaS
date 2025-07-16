import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

import { AuthenticationStrategy } from '../authentication.strategy';

@Injectable()
export class KeycloakAuthenticationStrategy implements AuthenticationStrategy {

    private readonly baseURL: string;
    private readonly realm: string;

    constructor(

    ) {
        this.baseURL = "http://localhost:8080/auth/";
        this.realm = "Organisation1";
    }

    /**
     * Call the OpenId Connect UserInfo endpoint on Keycloak: https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
     *
     * If it succeeds, the token is valid and we get the user infos in the response
     * If it fails, the token is invalid or expired
     */
    async authenticate(accessToken: string, realmName: string): Promise<any> {


        const url = `${process.env.KEYCLOAK_API}/auth/realms/${realmName}/protocol/openid-connect/userinfo`;

        try {
            const response = await axios.get(url, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            })

            return response.data;
        }
        catch (error) {
            throw new UnauthorizedException(error)
        }
    }

}
