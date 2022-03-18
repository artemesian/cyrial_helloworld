import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UnknwonIDException } from 'src/exceptions/exception';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandActionService } from 'src/services/hand-action.service';
import { HandService } from 'src/services/hand.service';
import { XpClaimService } from 'src/services/xp-claim.service';

@Controller('rewards')
export class RewardsController {
  constructor(
    private sequelize: Sequelize,
    private handService: HandService,
    private xpClaimService: XpClaimService,
    private gamePlayerService: GamePlayerService,
    private handActionService: HandActionService,
  ) {}

  @Patch('xp/:player_id')
  async claimXp(@Param('player_id') player_id: string) {
    if (!player_id) throw new UnknwonIDException('player');
    let number_of_hands = await this.getTotalNumberOfHands(player_id);
    const xpClaim = await this.xpClaimService.findOne(player_id);
    if (!xpClaim) throw new UnknwonIDException('player xp');
    let total_claimed_xp = xpClaim.getDataValue('claim_value');
    return this.sequelize.transaction(async (transaction) => {
      await this.xpClaimService.setXpClaim(
        { player_id, claim_value: number_of_hands - total_claimed_xp },
        transaction,
      );
      return { are_xp_claimed: true };
    });
  }

  @Get('xp')
  async getTotalNumberOfHands(@Query('player_id') player_id: string) {
    let number_of_hands = 0;
    const gamePlayers = await this.gamePlayerService.findGamePlayers(player_id);
    for (let i = 0; i < gamePlayers.length; i++) {
      const { game_id, game_player_id } = gamePlayers[i];
      const hands = await this.handService.findGameHands(game_id);
      for (let j = 0; j < hands.length; j++) {
        const { hand_id } = hands[0];
        const playerAction = await this.handActionService.findOne({
          game_player_id,
          hand_id,
        });
        if (playerAction && playerAction.hand_status !== 'pre-flop')
          number_of_hands++;
      }
    }
    return number_of_hands;
  }
}
