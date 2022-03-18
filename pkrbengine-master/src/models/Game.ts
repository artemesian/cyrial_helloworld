import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Model, Table } from 'sequelize-typescript';
import type { GamePlayer, GamePlayerId } from './GamePlayer';
import type { GameTable, GameTableId } from './GameTable';
import type { Hand, HandId } from './Hand';

export interface GameAttributes {
  game_id: string;
  type: 'limit' | 'no-limit' | 'pot-limit' | 'mixed';
  game_table_id: string;
  started_at?: Date;
  ended_at?: Date;
  number_of_hands: number;
}

export type GamePk = 'game_id';
export type GameId = Game[GamePk];
export type GameOptionalAttributes =
  | 'type'
  | 'started_at'
  | 'ended_at'
  | 'number_of_hands';
export type GameCreationAttributes = Optional<
  GameAttributes,
  GameOptionalAttributes
>;

@Table({
  tableName: "game"
})
export class Game
  extends Model<GameAttributes, GameCreationAttributes>
  implements GameAttributes
{
  @PrimaryKey
  @Column
  game_id!: string;
  @Column
  type!: 'limit' | 'no-limit' | 'pot-limit' | 'mixed';
  @Column
  game_table_id!: string;
  @Column
  started_at?: Date;
  @Column
  number_of_hands: number;
  @Column
  ended_at?: Date;

  // Game hasMany GamePlayer via game_id
  game_players!: GamePlayer[];
  getGame_players!: Sequelize.HasManyGetAssociationsMixin<GamePlayer>;
  setGame_players!: Sequelize.HasManySetAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  addGame_player!: Sequelize.HasManyAddAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  addGame_players!: Sequelize.HasManyAddAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  createGame_player!: Sequelize.HasManyCreateAssociationMixin<GamePlayer>;
  removeGame_player!: Sequelize.HasManyRemoveAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  removeGame_players!: Sequelize.HasManyRemoveAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  hasGame_player!: Sequelize.HasManyHasAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  hasGame_players!: Sequelize.HasManyHasAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  countGame_players!: Sequelize.HasManyCountAssociationsMixin;
  // Game hasMany Hand via game_id
  hands!: Hand[];
  getHands!: Sequelize.HasManyGetAssociationsMixin<Hand>;
  setHands!: Sequelize.HasManySetAssociationsMixin<Hand, HandId>;
  addHand!: Sequelize.HasManyAddAssociationMixin<Hand, HandId>;
  addHands!: Sequelize.HasManyAddAssociationsMixin<Hand, HandId>;
  createHand!: Sequelize.HasManyCreateAssociationMixin<Hand>;
  removeHand!: Sequelize.HasManyRemoveAssociationMixin<Hand, HandId>;
  removeHands!: Sequelize.HasManyRemoveAssociationsMixin<Hand, HandId>;
  hasHand!: Sequelize.HasManyHasAssociationMixin<Hand, HandId>;
  hasHands!: Sequelize.HasManyHasAssociationsMixin<Hand, HandId>;
  countHands!: Sequelize.HasManyCountAssociationsMixin;
  // Game belongsTo GameTable via game_table_id
  game_table!: GameTable;
  getGame_table!: Sequelize.BelongsToGetAssociationMixin<GameTable>;
  setGame_table!: Sequelize.BelongsToSetAssociationMixin<
    GameTable,
    GameTableId
  >;
  createGame_table!: Sequelize.BelongsToCreateAssociationMixin<GameTable>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Game {
    return Game.init(
      {
        game_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM('limit', 'no-limit', 'pot-limit', 'mixed'),
          allowNull: false,
          defaultValue: 'limit',
        },
        game_table_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'game_table',
            key: 'game_table_id',
          },
        },
        started_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        ended_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        number_of_hands: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: 'game',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'game_id' }],
          },
          {
            name: 'fk_Game_GameTable1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_table_id' }],
          },
        ],
      },
    );
  }
}
