import { Card } from '../models/Card';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';

import { Game } from 'src/models/Game';
import { Player } from 'src/models/Player';
import { CardSuit } from 'src/models/CardSuit';
import { GameTable } from 'src/models/GameTable';
import { HandCard } from 'src/models/HandCard';
import { GamePlayer } from 'src/models/GamePlayer';
import { CardService } from '../services/card.service';
import { GameService } from 'src/services/game.service';
import { AxoisService } from 'src/services/axios.service';
import { PlayerService } from 'src/services/player.service';
import { HandDetail } from 'src/models/HandDetail';
import { GameController } from '../controllers/game.controller';
import { HandCardService } from 'src/services/hand-card.service';
import { CardSuitService } from 'src/services/card-suit.service';
import { GameTableService } from 'src/services/game-table.service';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandDetailService } from 'src/services/hand-detail.service';
import { PlayerHole } from 'src/models/PlayerHole';
import { PlayerHoleService } from 'src/services/player-hole.service';
import { HandAction } from 'src/models/HandAction';
import { HandActionService } from 'src/services/hand-action.service';
import { HandWinner } from 'src/models/HandWinner';
import { HandWinnerService } from 'src/services/hand-winner.service';
import { HandCommunityService } from 'src/services/hand-community.service';
import { HandCommunity } from 'src/models/HandCommunity';
import { HandService } from 'src/services/hand.service';
import { Hand } from 'src/models/Hand';
import { ScheduleModule } from '@nestjs/schedule';
import { HandTasksService } from 'src/tasks/tasks.hand';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Card,
      Game,
      Hand,
      Player,
      CardSuit,
      HandCard,
      GameTable,
      GamePlayer,
      PlayerHole,
      HandAction,
      HandWinner,
      HandDetail,
      HandCommunity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  providers: [
    HandService,
    GameService,
    CardService,
    AxoisService,
    PlayerService,
    CardSuitService,
    HandCardService,
    GameTableService,
    GamePlayerService,
    HandTasksService,
    PlayerHoleService,
    HandActionService,
    HandWinnerService,
    HandDetailService,
    HandCommunityService,
  ],
  controllers: [GameController],
})
export class GameModule {}
