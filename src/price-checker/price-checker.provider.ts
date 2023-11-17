import { Provider } from '@nestjs/common';
import { PriceCheckerService } from './price-checker.service';
import { PriceCheckerMockService } from './price-checker-mock.service';
import { AppConfigService } from 'src/config/app/app-config.service';
import { PRICE_CHECKER_SERVICE_TOKEN } from 'src/common/constants';

export const priceCheckerProvider: Provider = {
  provide: PRICE_CHECKER_SERVICE_TOKEN,
  useFactory: (appConfigService: AppConfigService) => {
    if (appConfigService.env === 'test') return new PriceCheckerMockService();

    return new PriceCheckerService();
  },

  inject: [AppConfigService],
};
