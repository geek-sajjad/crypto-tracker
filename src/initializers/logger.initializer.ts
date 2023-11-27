import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

export function initializeLogger() {
  return WinstonModule.createLogger({
    transports: [
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%-error.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '120d',
        format: format.combine(format.timestamp(), format.json()),
      }),

      new transports.Console({
        format: format.combine(
          format.cli(),
          format.splat(),
          format.timestamp({ format: 'YYYY/MM/DD * hh:mm:ss:SSS' }),
          format.printf((info) => {
            return `(${info.timestamp}) [${
              info.level
            }] - ${info.message.trim()}`;
          }),
        ),
      }),
    ],
  });
}
