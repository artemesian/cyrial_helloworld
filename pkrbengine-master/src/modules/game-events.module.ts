import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GameEventGateway } from 'src/events/game-events.gateway';
import { GamePlayer } from 'src/models/GamePlayer';
import { Hand } from 'src/models/Hand';
import { HandAction } from 'src/models/HandAction';
import { HandCommunity } from 'src/models/HandCommunity';
import { HandDetail } from 'src/models/HandDetail';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandActionService } from 'src/services/hand-action.service';
import { HandCommunityService } from 'src/services/hand-community.service';
import { HandDetailService } from 'src/services/hand-detail.service';
import { HandService } from 'src/services/hand.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Hand,
      HandAction,
      GamePlayer,
      HandDetail,
      HandCommunity,
    ]),
  ],
  providers: [
    HandService,
    GameEventGateway,
    GamePlayerService,
    HandDetailService,
    HandActionService,
    HandCommunityService,
  ],
})
export class GameEventModule {}
