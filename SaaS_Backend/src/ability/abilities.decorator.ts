import { SetMetadata } from "@nestjs/common";
import { Action } from "./ability.factory";


export interface RequiredRule {
    action: Action,
    resource: string
}

export const CHECK_ABILITY = "check_ability"; 

export const checkAbilities = (requirements: RequiredRule) =>
    SetMetadata(CHECK_ABILITY, requirements);