import { NextFunction, Request, Response } from 'express';
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
}

export default RequestController;
