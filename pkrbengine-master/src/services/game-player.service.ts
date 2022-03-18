import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuid } from 'uuid';
import { GamePlayer } from 'src/models/GamePlayer';
import { CreateGamePlayerDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize/types';

@Injectable()
export class GamePlayerService {
  constructor(
    @InjectModel(GamePlayer)
    private gamePlayerModel: typeof GamePlayer,
  ) {}

  async create(gamePlayer: CreateGamePlayerDto, transaction?: Transaction) {
    return this.gamePlayerModel.create(
      {
        ...gamePlayer,
        sat_in_at: new Date(),
        game_player_id: uuid(),
      },
      {
        fields: [
          'pseudo',
          'balance',
          'game_id',
          'player_id',
          'sat_in_at',
          'game_player_id',
          'player_position',
          'is_in_active_hand',
        ],
        transaction,
      },
    );
  }

  async findOne(game_player_id: string, transaction?: Transaction) {
    return this.gamePlayerModel.findOne({
      where: { game_player_id },
      transaction,
    });
  }

  async findAll(game_id?: string, transaction?: Transaction) {
    return this.gamePlayerModel.findAll({
      where: game_id ? { game_id } : {},
      transaction,
    });
  }

  async findSeatedPlayers(game_id: string, transaction?: Transaction) {
    return this.gamePlayerModel.findAll({
      where: { game_id, left_game_at: null },
      transaction,
    });
  }

  async findGamePlayer(
    query: { player_id: string; game_id: string },
    transaction?: Transaction,
  ) {
    return this.gamePlayerModel.findOne({
      where: query,
      transaction,
    });
  }

  async findGamePlayers(player_id: string, transaction?: Transaction) {
    return this.gamePlayerModel.findAll({
      where: { player_id },
      transaction,
    });
  }

  async findActivePlayers(game_id: string, transaction?: Transaction) {
    return this.gamePlayerModel.findAll({
      order: [['player_position', 'ASC']],
      where: { game_id, is_in_active_hand: true },
      transaction,
    });
  }

  async update(game_player_id: string, data: {}, transaction?: Transaction) {
    return this.gamePlayerModel.update(data, {
      where: { game_player_id, left_game_at: null },
      transaction,
    });
  }
}
