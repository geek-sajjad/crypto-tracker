import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { IPriceCheckerService } from './interfaces';

@Injectable()
export class PriceCheckerService implements IPriceCheckerService {
  async fetchPrice(cryptoName: string) {
    try {
      const url = `https://api.coincap.io/v2/assets/${cryptoName}`;

      const { data } = await axios.get(url);
      return data['data'];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('The cryptoName not found!');
      }
      throw error;
    }
  }
}
