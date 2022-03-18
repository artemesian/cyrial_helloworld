import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RewardsController } from 'src/controllers/rewards.comtroller';
import { GamePlayer } from 'src/models/GamePlayer';
import { Hand } from 'src/models/Hand';
import { HandAction } from 'src/models/HandAction';
import { Player } from 'src/models/Player';
import { XpClaim } from 'src/models/XpClaim';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandActionService } from 'src/services/hand-action.service';
import { HandService } from 'src/services/hand.service';
import { PlayerService } from 'src/services/player.service';
import { XpClaimService } from 'src/services/xp-claim.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Player, XpClaim, HandAction, GamePlayer, Hand]),
  ],
  providers: [
    HandService,
    PlayerService,
    XpClaimService,
    HandActionService,
    GamePlayerService,
  ],
  controllers: [RewardsController],
})
export class RewardsModule {}
