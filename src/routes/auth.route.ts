import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '../dtos/users.dto';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';

class AuthRoute implements Route {
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/signup', validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.post('/login', validationMiddleware(LoginUserDto, 'body'), this.authController.logIn);
    this.router.post('/logout', authMiddleware, this.authController.logOut);
    this.router.post('/doctor-signup', authMiddleware, this.authController.doctorSignUp);
    this.router.get('/refresh', this.authController.refresh)
    this.router.post('/capcha-verify', this.authController.capcha)
    this.router.get('/verify', this.authController.verify)
    this.router.post('/notification', authMiddleware, this.authController.notification)
  }
}

export default AuthRoute;
