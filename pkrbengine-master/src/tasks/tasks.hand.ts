import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Sequelize } from 'sequelize-typescript';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandActionService } from 'src/services/hand-action.service';
import { HandDetailService } from 'src/services/hand-detail.service';
import { HandService } from 'src/services/hand.service';

@Injectable()
export class HandTasksService {
  private readonly logger = new Logger(HandTasksService.name);
  constructor(
    private sequelize: Sequelize,
    private handService: HandService,
    private schedulerRegistry: SchedulerRegistry,
    private gamePlayerService: GamePlayerService,
    private handDetailService: HandDetailService,
    private handActionService: HandActionService,
  ) {}

  setTasksTimeOut(
    name: string,
    seconds: number,
    data: { game_player_id: string; hand_id: string; hand_detail_id: string },
    tasksCallback: Function,
  ) {
    const callback = () => {
      const { game_player_id, hand_detail_id, hand_id } = data;
      tasksCallback(hand_id, 'skip', 0, game_player_id, hand_detail_id);
      this.logger.warn(`Timeout ${name} executing after (${seconds}s)!`);
    };
    this.logger.warn(`Timeout ${name} will be executed after (${seconds}s)!`);
    const timeout = setTimeout(callback, seconds * 1000);
    this.schedulerRegistry.addTimeout(name, timeout);
  }
}
