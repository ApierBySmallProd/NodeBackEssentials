import { ServiceRequest } from '../../..';

export interface LoginParameters {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    name: string;
    pseudo: string;
    age: number;
  };
}

export interface LoginErrorData {
  email: string;
  password: string;
}

export type LoginRequest = ServiceRequest<LoginParameters, LoginResponse, LoginErrorData>;
