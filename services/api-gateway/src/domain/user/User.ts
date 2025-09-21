import { UserRole } from "./UserRole";

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export class User implements IUser {
  constructor(
    public id: string,
    public email: string,
    public role: UserRole,
    public firstName?: string,
    public lastName?: string
  ) {}
}
