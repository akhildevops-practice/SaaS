import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_ABILITY, RequiredRule } from './abilities.decorator';
import { accessRights } from '../utils/access-rights';

/**
 * This is a custom guard to authorize user requests according to their specified access rights.
 */

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      {};
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userRoles = user.kcRoles?.roles;

    /*  We assume users will have multiple roles, so we check if any of the user role has the required access right */
    /* authorize the user based on the access rights of that specific role. */
    return userRoles?.some((role) =>
      accessRights?.[role]?.[rules.resource].includes(rules.action),
    );
  }
}
