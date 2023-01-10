import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import CalendarController from '../controllers/calendar.controller';

class CalendarRoute implements Route {
    public router = Router();
    public calendarController = new CalendarController();

    constructor() {
      this.initializeRoutes();
    }

    private initializeRoutes() {
      this.router.get('/createCalendar', this.calendarController.createCalendar);
    //   this.router.post('/login', validationMiddleware(LoginUserDto, 'body'), this.authController.logIn);
    //   this.router.post('/logout', authMiddleware, this.authController.logOut);
    //   this.router.post('/doctor-signup', authMiddleware, this.authController.doctorSignUp);
      this.router.get('/getInitCalendar', this.calendarController.getFullCalendar)
    //   this.router.post('/capcha-verify', this.authController.capcha)
    //   this.router.get('/verify', this.authController.verify)
    //   this.router.post('/notification', authMiddleware, this.authController.notification)
    }
}

export default CalendarRoute;
