import { NextFunction, Response } from 'express';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import { UserEntity } from '../entity/users.entity';
import AuthService from '../services/auth.service';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authService = new AuthService();
    const cookies = req.cookies;
    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader){
      next(new HttpException(404, 'Authentication token missing'));
    }
    const accessToken = authorizationHeader.split(' ')[1]
    if(!accessToken){
      next(new HttpException(404, 'Authentication token missing'));
    }
    const userData = await authService.validateAccessToken(accessToken)
    if(!userData){
      next(new HttpException(404, 'Authentication token missing'));
    }
    req.user = userData;
    next()
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
