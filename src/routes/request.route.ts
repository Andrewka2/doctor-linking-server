import { Router } from 'express';
import RequestController from '../controllers/request.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';

class RequestRoute implements Route {
  public router = Router();
  public requestController = new RequestController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/set-request', authMiddleware, this.requestController.setRequest);
  }
}

export default RequestRoute;
