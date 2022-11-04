import { Request } from 'express';
import { ObjectID } from 'typeorm';
import { User, UserRegistration } from './users.interface';

export interface DataStoredInToken {
  id: number;
  email: string;
}

export interface TokenData {
  refreshToken: string;
  accessToken: string;
}

export interface RequestWithUser extends Request {
  user: any;
}
