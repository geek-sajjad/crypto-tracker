import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AlertService } from 'src/alert/alert.service';
import { AppConfigService } from 'src/config/app/app-config.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor(
    private alertService: AlertService,
    private appConfigService: AppConfigService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 500) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      this.sendAlertToAdmin(exception.message);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }

  sendAlertToAdmin(errorDetail: string) {
    this.alertService.sendServerErrorsMailAlert(errorDetail);
  }
}
