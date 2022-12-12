import { Entity, ObjectIdColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ObjectID } from 'typeorm';
import { RefreshTokenEntity } from '../entity/token.entity';

export interface Doctor {
  id: number;
  email: string;
  name: string;
  surname: string;
  position: string;
  phone: number;
  password: string;
  refreshToken: RefreshTokenEntity
}