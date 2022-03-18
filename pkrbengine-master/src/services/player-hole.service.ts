import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePlayerHoleDto } from 'src/models/create-dto';
import { PlayerHole } from 'src/models/PlayerHole';
import { Transaction } from 'sequelize/types';

@Injectable()
export class PlayerHoleService {
  constructor(
    @InjectModel(PlayerHole)
    private playerHoleModel: typeof PlayerHole,
  ) {}

  async bulkCreate(
    playerHoles: CreatePlayerHoleDto[],
    transaction?: Transaction,
  ) {
    return this.playerHoleModel.bulkCreate(
      [
        ...playerHoles.map(({ hand_card_id, game_player_id }) => ({
          hand_card_id,
          game_player_id,
          distributed_at: new Date(),
          player_hole_id: uuid(),
        })),
      ],
      {
        fields: [
          'hand_card_id',
          'game_player_id',
          'distributed_at',
          'player_hole_id',
        ],
        transaction,
      },
    );
  }

  async findAll(
    condition: { game_player_id?: string; hand_card_id?: string },
    transaction?: Transaction,
  ) {
    return this.playerHoleModel.findAll({
      where: condition,
      transaction,
    });
  }
}
