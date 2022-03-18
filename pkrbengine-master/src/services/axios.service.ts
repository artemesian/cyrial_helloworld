import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AxoisService {
  constructor(private httpService: HttpService) {}

  async serverStartGame(game_id: string) {
    const game_cards = this.httpService.post(`${game_id}/start`, {}, {});
    console.log(game_cards);
  }
}
