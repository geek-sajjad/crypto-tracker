import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { AlertService } from 'src/alert/alert.service';
import { Response, Request } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private alertService: AlertService) {}
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `Unhandled exception: ${exception.message}`,
      exception.stack,
    );
    this.sendAlertToAdmin(exception.message);

    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal Server Error',
    });
  }
  sendAlertToAdmin(errorDetail: string) {
    this.alertService.sendServerErrorsMailAlert(errorDetail);
  }
}
