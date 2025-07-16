import { Inject, Injectable, Logger } from '@nestjs/common';


import { User } from './user.model';
import { AUTHENTICATION_STRATEGY_TOKEN } from './authentication.strategy';
import { KeycloakAuthenticationStrategy } from './strategy/keycloak.strategy';
import { UserService } from '../user/user.service';

export class AuthenticationError extends Error { }

@Injectable()
export class AuthenticationService {

    private logger = new Logger(AuthenticationService.name);

    constructor(
        private readonly strategy: KeycloakAuthenticationStrategy, private userService: UserService
    ) { }

    async authenticate(accessToken: string, realm: string): Promise<User> {
        try {
            //(accessToken)
            const userInfos = await this.strategy.authenticate(accessToken, realm);




            const checkUser = await this.userService.checkIfUserActive(realm, userInfos)
            // ("idp", detectIdpUser)

            if (checkUser) {
                return {
                    id: userInfos.sub,
                    username: userInfos.preferred_username,
                };
            } else {
                throw new AuthenticationError("IDP USER CREATION FAILED, PLEASE TRY AGAIN")
            }

            /**
             * Perform any addition business logic with the user:
             * - insert user in "users" table on first authentication,
             * - etc.
             */


        } catch (e) {

            //(e.message);
            throw new AuthenticationError(e.message);
        }
    }
}
