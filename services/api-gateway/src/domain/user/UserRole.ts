export type UserRole = 'admin' | 'vet' | 'staff' | 'client';

export class UserRoles {
  static ADMIN: UserRole = 'admin';
  static VET: UserRole = 'vet';
  static STAFF: UserRole = 'staff';
  static CLIENT: UserRole = 'client';

  static allRoles(): UserRole[] {
    return [this.ADMIN, this.VET, this.STAFF, this.CLIENT];
  }

  static isValid(role: string): boolean {
    return this.allRoles().includes(role as UserRole);
  }
}
