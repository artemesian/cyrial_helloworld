import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Game } from 'src/models/Game';
import { GameTable } from 'src/models/GameTable';
import { GamePlayer } from 'src/models/GamePlayer';
import { GameService } from 'src/services/game.service';
import { LobbyConrtroller } from 'src/controllers/lobby.controller';
import { GameTableService } from 'src/services/game-table.service';
import { GamePlayerService } from 'src/services/game-player.service';

@Module({
  imports: [SequelizeModule.forFeature([Game, GameTable, GamePlayer])],
  providers: [GameService, GameTableService, GamePlayerService],
  controllers: [LobbyConrtroller],
})
export class LobbyModule {}
