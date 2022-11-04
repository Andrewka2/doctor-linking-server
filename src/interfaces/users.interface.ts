import { Entity, ObjectIdColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ObjectID } from 'typeorm';
import { RefreshTokenEntity } from '../entity/token.entity';

export interface User {
  id: number;
  email: string;
  password: string;
  refreshToken: RefreshTokenEntity
}

export interface UserRegistration{
  email: string,
  id: number,
  password?: string
}