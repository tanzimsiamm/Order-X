// Auth related interfaces

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: Omit<IUser, "updatedAt">;
  token: string;
}

export interface IUserWithPassword extends IUser {
  password: string;
}

// Service return types
export type RegisterResult = IAuthResponse;
export type LoginResult = IAuthResponse;
