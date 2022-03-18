import type { Sequelize } from "sequelize";
import { Card as _Card } from "./Card";
import type { CardAttributes, CardCreationAttributes } from "./Card";
import { CardSuit as _CardSuit } from "./CardSuit";
import type { CardSuitAttributes, CardSuitCreationAttributes } from "./CardSuit";
import { Game as _Game } from "./Game";
import type { GameAttributes, GameCreationAttributes } from "./Game";
import { GamePlayer as _GamePlayer } from "./GamePlayer";
import type { GamePlayerAttributes, GamePlayerCreationAttributes } from "./GamePlayer";
import { GameTable as _GameTable } from "./GameTable";
import type { GameTableAttributes, GameTableCreationAttributes } from "./GameTable";
import { Hand as _Hand } from "./Hand";
import type { HandAttributes, HandCreationAttributes } from "./Hand";
import { HandAction as _HandAction } from "./HandAction";
import type { HandActionAttributes, HandActionCreationAttributes } from "./HandAction";
import { HandCard as _HandCard } from "./HandCard";
import type { HandCardAttributes, HandCardCreationAttributes } from "./HandCard";
import { HandCommunity as _HandCommunity } from "./HandCommunity";
import type { HandCommunityAttributes, HandCommunityCreationAttributes } from "./HandCommunity";
import { HandDetail as _HandDetail } from "./HandDetail";
import type { HandDetailAttributes, HandDetailCreationAttributes } from "./HandDetail";
import { HandWinner as _HandWinner } from "./HandWinner";
import type { HandWinnerAttributes, HandWinnerCreationAttributes } from "./HandWinner";
import { Player as _Player } from "./Player";
import type { PlayerAttributes, PlayerCreationAttributes } from "./Player";
import { PlayerHole as _PlayerHole } from "./PlayerHole";
import type { PlayerHoleAttributes, PlayerHoleCreationAttributes } from "./PlayerHole";
import { XpClaim as _XpClaim } from "./XpClaim";
import type { XpClaimAttributes, XpClaimCreationAttributes } from "./XpClaim";

export {
  _Card as Card,
  _CardSuit as CardSuit,
  _Game as Game,
  _GamePlayer as GamePlayer,
  _GameTable as GameTable,
  _Hand as Hand,
  _HandAction as HandAction,
  _HandCard as HandCard,
  _HandCommunity as HandCommunity,
  _HandDetail as HandDetail,
  _HandWinner as HandWinner,
  _Player as Player,
  _PlayerHole as PlayerHole,
  _XpClaim as XpClaim,
};

export type {
  CardAttributes,
  CardCreationAttributes,
  CardSuitAttributes,
  CardSuitCreationAttributes,
  GameAttributes,
  GameCreationAttributes,
  GamePlayerAttributes,
  GamePlayerCreationAttributes,
  GameTableAttributes,
  GameTableCreationAttributes,
  HandAttributes,
  HandCreationAttributes,
  HandActionAttributes,
  HandActionCreationAttributes,
  HandCardAttributes,
  HandCardCreationAttributes,
  HandCommunityAttributes,
  HandCommunityCreationAttributes,
  HandDetailAttributes,
  HandDetailCreationAttributes,
  HandWinnerAttributes,
  HandWinnerCreationAttributes,
  PlayerAttributes,
  PlayerCreationAttributes,
  PlayerHoleAttributes,
  PlayerHoleCreationAttributes,
  XpClaimAttributes,
  XpClaimCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Card = _Card.initModel(sequelize);
  const CardSuit = _CardSuit.initModel(sequelize);
  const Game = _Game.initModel(sequelize);
  const GamePlayer = _GamePlayer.initModel(sequelize);
  const GameTable = _GameTable.initModel(sequelize);
  const Hand = _Hand.initModel(sequelize);
  const HandAction = _HandAction.initModel(sequelize);
  const HandCard = _HandCard.initModel(sequelize);
  const HandCommunity = _HandCommunity.initModel(sequelize);
  const HandDetail = _HandDetail.initModel(sequelize);
  const HandWinner = _HandWinner.initModel(sequelize);
  const Player = _Player.initModel(sequelize);
  const PlayerHole = _PlayerHole.initModel(sequelize);
  const XpClaim = _XpClaim.initModel(sequelize);

  HandCard.belongsTo(Card, { as: "card", foreignKey: "card_id"});
  Card.hasMany(HandCard, { as: "hand_cards", foreignKey: "card_id"});
  Card.belongsTo(CardSuit, { as: "card_suit", foreignKey: "card_suit_id"});
  CardSuit.hasMany(Card, { as: "cards", foreignKey: "card_suit_id"});
  GamePlayer.belongsTo(Game, { as: "game", foreignKey: "game_id"});
  Game.hasMany(GamePlayer, { as: "game_players", foreignKey: "game_id"});
  Hand.belongsTo(Game, { as: "game", foreignKey: "game_id"});
  Game.hasMany(Hand, { as: "hands", foreignKey: "game_id"});
  HandAction.belongsTo(GamePlayer, { as: "game_player", foreignKey: "game_player_id"});
  GamePlayer.hasMany(HandAction, { as: "hand_actions", foreignKey: "game_player_id"});
  HandDetail.belongsTo(GamePlayer, { as: "game_double_game_player", foreignKey: "game_double"});
  GamePlayer.hasMany(HandDetail, { as: "hand_details", foreignKey: "game_double"});
  HandDetail.belongsTo(GamePlayer, { as: "active_player_game_player", foreignKey: "active_player"});
  GamePlayer.hasMany(HandDetail, { as: "active_player_hand_details", foreignKey: "active_player"});
  HandWinner.belongsTo(GamePlayer, { as: "game_player", foreignKey: "game_player_id"});
  GamePlayer.hasMany(HandWinner, { as: "hand_winners", foreignKey: "game_player_id"});
  PlayerHole.belongsTo(GamePlayer, { as: "game_player", foreignKey: "game_player_id"});
  GamePlayer.hasMany(PlayerHole, { as: "player_holes", foreignKey: "game_player_id"});
  Game.belongsTo(GameTable, { as: "game_table", foreignKey: "game_table_id"});
  GameTable.hasMany(Game, { as: "games", foreignKey: "game_table_id"});
  HandAction.belongsTo(Hand, { as: "hand", foreignKey: "hand_id"});
  Hand.hasMany(HandAction, { as: "hand_actions", foreignKey: "hand_id"});
  HandCard.belongsTo(Hand, { as: "hand", foreignKey: "hand_id"});
  Hand.hasMany(HandCard, { as: "hand_cards", foreignKey: "hand_id"});
  HandCommunity.belongsTo(Hand, { as: "hand", foreignKey: "hand_id"});
  Hand.hasMany(HandCommunity, { as: "hand_communities", foreignKey: "hand_id"});
  HandDetail.belongsTo(Hand, { as: "hand", foreignKey: "hand_id"});
  Hand.hasMany(HandDetail, { as: "hand_details", foreignKey: "hand_id"});
  HandWinner.belongsTo(Hand, { as: "hand", foreignKey: "hand_id"});
  Hand.hasMany(HandWinner, { as: "hand_winners", foreignKey: "hand_id"});
  HandCommunity.belongsTo(HandCard, { as: "game_card", foreignKey: "game_card_id"});
  HandCard.hasMany(HandCommunity, { as: "hand_communities", foreignKey: "game_card_id"});
  PlayerHole.belongsTo(HandCard, { as: "game_hand_card", foreignKey: "game_hand_card_id"});
  HandCard.hasMany(PlayerHole, { as: "player_holes", foreignKey: "game_hand_card_id"});
  GamePlayer.belongsTo(Player, { as: "player", foreignKey: "player_id"});
  Player.hasMany(GamePlayer, { as: "game_players", foreignKey: "player_id"});
  GameTable.belongsTo(Player, { as: "owned_by_player", foreignKey: "owned_by"});
  Player.hasMany(GameTable, { as: "game_tables", foreignKey: "owned_by"});
  XpClaim.belongsTo(Player, { as: "player", foreignKey: "player_id"});
  Player.hasMany(XpClaim, { as: "xp_claims", foreignKey: "player_id"});

  return {
    Card: Card,
    CardSuit: CardSuit,
    Game: Game,
    GamePlayer: GamePlayer,
    GameTable: GameTable,
    Hand: Hand,
    HandAction: HandAction,
    HandCard: HandCard,
    HandCommunity: HandCommunity,
    HandDetail: HandDetail,
    HandWinner: HandWinner,
    Player: Player,
    PlayerHole: PlayerHole,
    XpClaim: XpClaim,
  };
}
