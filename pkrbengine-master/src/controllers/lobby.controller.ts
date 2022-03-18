import { Controller, Get, Query } from '@nestjs/common';

import { GameTable } from 'src/models/GameTable';
import { GameService } from 'src/services/game.service';
import { GameTableService } from 'src/services/game-table.service';
import { GamePlayerService } from 'src/services/game-player.service';
import { IncompleteDataException } from 'src/exceptions/exception';

@Controller('lobby')
export class LobbyConrtroller {
  constructor(
    private gameService: GameService,
    private gameTableService: GameTableService,
    private gamePlayerService: GamePlayerService,
  ) {}

  @Get('tables')
  async findAllTables() {
    let availableTables: GameTable[] = [];
    const gameTables = await this.gameTableService.findAll();
    for (let i = 0; i < gameTables.length; i++) {
      const { game_table_id: i_game_table_id, number_of_seats } = gameTables[i];
      const game = await this.gameService.findTableGame(i_game_table_id);
      if (!game) availableTables = [...availableTables, gameTables[i]];
      else {
        const { game_id } = game;
        const players = await this.gamePlayerService.findSeatedPlayers(game_id);
        if (players.length < number_of_seats)
          availableTables = [...availableTables, gameTables[i]];
      }
    }
    return availableTables;
  }

  @Get('players')
  async findAllPlayers(@Query('game_id') game_id: string) {
    if (!game_id) throw new IncompleteDataException({ game_id });
    return await this.gamePlayerService.findAll(game_id);
  }
}
