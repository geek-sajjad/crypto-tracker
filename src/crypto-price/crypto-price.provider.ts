// import { Provider } from '@nestjs/common';
// import { CryptoPriceService } from './crypto-price.service';
// import { CryptoPriceServiceMockService } from './crypto-price-mock.service';
// import { AppConfigService } from 'src/config/app/app-config.service';
// import { CRYPTO_PRICE_SERVICE_TOKEN } from 'src/common/constants';

// export const cryptoPriceProvider: Provider = {
//   provide: CRYPTO_PRICE_SERVICE_TOKEN,
//   useFactory: (appConfigService: AppConfigService) => {
//     if (appConfigService.env === 'test')
//       return new CryptoPriceServiceMockService();

//     return new CryptoPriceService();
//   },

//   inject: [AppConfigService],
// };
