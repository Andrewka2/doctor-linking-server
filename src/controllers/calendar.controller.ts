import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { UserMonthData } from '../interfaces/calendar.interface';
import { User } from '../interfaces/users.interface';
import CalendarService from '../services/calendar.service';

class CalendarController {
  public calendarService = new CalendarService();

  public getFullCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllCalendarData: UserMonthData[] = await this.calendarService.getAllData();

      res.status(200).json({ data: findAllCalendarData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getCalendarById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const findCalendarData: UserMonthData = await this.calendarService.findCalendarById(userId);

      res.status(200).json({ data: findCalendarData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const createCalendarData = await this.calendarService.createCalendar();

      res.status(201).json({ data: createCalendarData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const userData: User = req.body;
      const updateCalendarData: UserMonthData = await this.calendarService.updateCalendar(userId, userData);

      res.status(200).json({ data: updateCalendarData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

//   public deleteCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = Number(req.params.id);
//       const deleteCalendarData: UserMonthData = await this.calendarService.getAllData(user);

//       res.status(200).json({ data: deleteCalendarData, message: 'deleted' });
//     } catch (error) {
//       next(error);
//     }
//   };
}

export default CalendarController;
