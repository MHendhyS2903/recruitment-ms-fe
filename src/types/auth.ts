export type UserRole = 'SUPER_ADMIN' | 'RECRUITER' | 'SALES' | 'FINANCE';

export interface AuthUser {
  id: string | number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
