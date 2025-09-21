import { IUser } from '../../domain/user/User';
import { AuthService } from './AuthService';
import { AuthorizationError } from '@vetclinic/shared-kernel';

export class AuthFacade {
  constructor(private authService: AuthService) {}

  async authenticate(token: string): Promise<IUser> {
    return this.authService.verifyToken(token);
  }

  authorize(user: IUser, roles: string[]): void {
    if (roles.length && !roles.includes(user.role)) {
      throw new AuthorizationError(
        `Forbidden: required roles [${roles.join(', ')}], user role is ${user.role}`,
        undefined,
        'AuthFacade',
        roles
      );
    }
  }
}
