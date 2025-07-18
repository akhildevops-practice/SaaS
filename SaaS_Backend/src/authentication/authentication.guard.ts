import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';
import { Request } from 'express';
import jwt_decode from "jwt-decode";

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(
        private readonly authenticationService: AuthenticationService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();


        const header = request.header('Authorization');


        if (!header) {
            throw new HttpException('Authorization: Bearer <token> header missing', HttpStatus.UNAUTHORIZED);
        }

        const parts = header.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new HttpException('Authorization: Bearer <token> header invalid', HttpStatus.UNAUTHORIZED);
        }

        const token = parts[1];
        //(token)


        try {
            // Store the user on the request object if we want to retrieve it from the controllers
            //(token);
            const decoded: any = await jwt_decode(token);


            //(decoded);
            const tokenGeneratorUrl = decoded.iss.split('/realms/');
            //(decoded.iss)("in gaurd")
            const realmName = tokenGeneratorUrl[1]

            request['user'] = await this.authenticationService.authenticate(token, realmName);


            if (request.user) {
                // ("yser", request.user)


                request.user['kcRoles'] = decoded?.realm_access

                request.user['kcToken'] = token

            }

            return true;
        } catch (e) {


            throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
