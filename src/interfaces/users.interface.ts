import { Entity, ObjectIdColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ObjectID } from 'typeorm';
import { RefreshTokenEntity } from '../entity/token.entity';

export interface User {
  id: number;
  name: string
  email: string;
  surname: string;
  position: string;
  phone: string;
  role: string;
  isTemporary: boolean;
  password: string;
  refreshToken: RefreshTokenEntity
}

export interface UserRegistration{
  email: string,
  name: string,
  id: number,
  surname: string, 
  position: string,
  phone: string,
  role: string,
  isTemporary: boolean,
  password?: string
}