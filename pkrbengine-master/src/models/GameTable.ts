import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Model, Table } from 'sequelize-typescript';
import type { Game, GameId } from './Game';
import type { Player, PlayerId } from './Player';

export interface GameTableAttributes {
  game_table_id: string;
  number_of_seats: number;
  small_blind: number;
  big_blind: number;
  owned_by: string;
  is_open: boolean;
  mined_at: Date;
  table_name: string;
  is_blocked: boolean;
}

export type GameTablePk = 'game_table_id';
export type GameTableId = GameTable[GameTablePk];
export type GameTableOptionalAttributes = 'is_open';
export type GameTableCreationAttributes = Optional<
  GameTableAttributes,
  GameTableOptionalAttributes
>;
@Table({
  tableName: "game_table"
})
export class GameTable
  extends Model<GameTableAttributes, GameTableCreationAttributes>
  implements GameTableAttributes
{
  @PrimaryKey
  @Column
  game_table_id!: string;
  @Column
  number_of_seats!: number;
  @Column
  small_blind!: number;
  @Column
  big_blind!: number;
  @Column
  owned_by!: string;
  @Column
  is_open!: boolean;
  @Column
  mined_at!: Date;
  @Column
  table_name!: string;
  @Column
  is_blocked!: boolean;

  // GameTable hasMany Game via game_table_id
  games!: Game[];
  getGames!: Sequelize.HasManyGetAssociationsMixin<Game>;
  setGames!: Sequelize.HasManySetAssociationsMixin<Game, GameId>;
  addGame!: Sequelize.HasManyAddAssociationMixin<Game, GameId>;
  addGames!: Sequelize.HasManyAddAssociationsMixin<Game, GameId>;
  createGame!: Sequelize.HasManyCreateAssociationMixin<Game>;
  removeGame!: Sequelize.HasManyRemoveAssociationMixin<Game, GameId>;
  removeGames!: Sequelize.HasManyRemoveAssociationsMixin<Game, GameId>;
  hasGame!: Sequelize.HasManyHasAssociationMixin<Game, GameId>;
  hasGames!: Sequelize.HasManyHasAssociationsMixin<Game, GameId>;
  countGames!: Sequelize.HasManyCountAssociationsMixin;
  // GameTable belongsTo Player via owned_by
  owned_by_player!: Player;
  getOwned_by_player!: Sequelize.BelongsToGetAssociationMixin<Player>;
  setOwned_by_player!: Sequelize.BelongsToSetAssociationMixin<Player, PlayerId>;
  createOwned_by_player!: Sequelize.BelongsToCreateAssociationMixin<Player>;

  static initModel(sequelize: Sequelize.Sequelize): typeof GameTable {
    return GameTable.init(
      {
        game_table_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        number_of_seats: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        small_blind: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        big_blind: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        owned_by: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'player',
            key: 'player_id',
          },
        },
        is_open: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 1,
        },
        mined_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        table_name: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        is_blocked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'game_table',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'game_table_id' }],
          },
          {
            name: 'fk_GameTable_Player_idx',
            using: 'BTREE',
            fields: [{ name: 'owned_by' }],
          },
        ],
      },
    );
  }
}
