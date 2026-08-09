import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: Role;         
    status?: UserStatus;
}
export interface IUpdateUser{
    name? : string;
    phone? : string;
}