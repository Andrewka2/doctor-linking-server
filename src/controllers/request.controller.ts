import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
import RequestService from '../services/request.service';

class RequestController {
  public requestService = new RequestService();

  public setRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestData = req.body;
      console.log(requestData)
      const result = await this.requestService.setRequest(requestData);
      res.status(201).json({ message: 'request sended' });
    } catch (error) {
      next(error);
    }
  };
  public getRequest = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.user.id
      const result = await this.requestService.getRequest(id);
      res.status(201).json({data: result, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };
}

export default RequestController;
