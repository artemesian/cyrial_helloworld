import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { GamePlayer, GamePlayerId } from './GamePlayer';
import type { Hand, HandId } from './Hand';

export interface HandDetailAttributes {
  hand_detail_id: string;
  game_double: string;
  active_player: string;
  hand_id: string;
}

export type HandDetailPk = 'hand_detail_id';
export type HandDetailId = HandDetail[HandDetailPk];
export type HandDetailCreationAttributes = HandDetailAttributes;

@Table({
  tableName: 'hand_detail',
})
export class HandDetail
  extends Model<HandDetailAttributes, HandDetailCreationAttributes>
  implements HandDetailAttributes
{
  @PrimaryKey
  @Column
  hand_detail_id!: string;
  @Column
  game_double!: string;
  @Column
  active_player!: string;
  @Column
  hand_id!: string;

  // HandDetail belongsTo GamePlayer via game_double
  game_double_game_player!: GamePlayer;
  getGame_double_game_player!: Sequelize.BelongsToGetAssociationMixin<GamePlayer>;
  setGame_double_game_player!: Sequelize.BelongsToSetAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  createGame_double_game_player!: Sequelize.BelongsToCreateAssociationMixin<GamePlayer>;
  // HandDetail belongsTo GamePlayer via active_player
  active_player_game_player!: GamePlayer;
  getActive_player_game_player!: Sequelize.BelongsToGetAssociationMixin<GamePlayer>;
  setActive_player_game_player!: Sequelize.BelongsToSetAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  createActive_player_game_player!: Sequelize.BelongsToCreateAssociationMixin<GamePlayer>;
  // HandDetail belongsTo Hand via hand_id
  hand!: Hand;
  getHand!: Sequelize.BelongsToGetAssociationMixin<Hand>;
  setHand!: Sequelize.BelongsToSetAssociationMixin<Hand, HandId>;
  createHand!: Sequelize.BelongsToCreateAssociationMixin<Hand>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HandDetail {
    return HandDetail.init(
      {
        hand_detail_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        game_double: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'game_player',
            key: 'game_player_id',
          },
        },
        active_player: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'game_player',
            key: 'game_player_id',
          },
        },
        hand_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'hand',
            key: 'hand_id',
          },
        },
      },
      {
        sequelize,
        tableName: 'hand_detail',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'hand_detail_id' }],
          },
          {
            name: 'fk_HandDetail_GamePlayer1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_double' }],
          },
          {
            name: 'fk_HandDetail_GamePlayer2_idx',
            using: 'BTREE',
            fields: [{ name: 'active_player' }],
          },
          {
            name: 'fk_Game_player_detail_Game_hand1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_id' }],
          },
        ],
      },
    );
  }
}
