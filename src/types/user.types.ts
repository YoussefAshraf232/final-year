export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  leftAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: UserRole;
}
