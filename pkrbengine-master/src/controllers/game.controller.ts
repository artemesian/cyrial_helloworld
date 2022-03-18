import { Body, Post, Patch, Param, Controller, Put } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Sequelize } from 'sequelize-typescript';
import { GamePlayer } from 'src/models/GamePlayer';
import { uniqueNamesGenerator, names, languages } from 'unique-names-generator';

import { CardService } from 'src/services/card.service';
import { GameService } from 'src/services/game.service';
import { AxoisService } from 'src/services/axios.service';
import { PlayerService } from 'src/services/player.service';
import { HandCardService } from 'src/services/hand-card.service';
import { GameTableService } from 'src/services/game-table.service';
import { PlayerHoleService } from 'src/services/player-hole.service';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandDetailService } from 'src/services/hand-detail.service';
import { HandActionService } from 'src/services/hand-action.service';
import { HandWinnerService } from 'src/services/hand-winner.service';
import {
  GameActionException,
  GameException,
  IncompleteDataException,
  UnknwonIDException,
} from 'src/exceptions/exception';
import { HandCommunityService } from 'src/services/hand-community.service';
import { HandCommunity } from 'src/models/HandCommunity';
import { TexasHoldem } from 'poker-odds-calc';
import { CardSuitService } from 'src/services/card-suit.service';
import { HandService } from 'src/services/hand.service';
import { Transaction } from 'sequelize/types';
import { HandTasksService } from 'src/tasks/tasks.hand';

enum eGameType {
  limit = 'limit',
  no_limit = 'no-limit',
  pot_limit = 'pot-limit',
  mixed = 'mixed',
}

enum eHandAction {
  fold = 'fold',
  bet = 'bet',
  check = 'check',
  call = 'call',
  raise = 'raise',
  all_in = 'all_in',
  skip = 'skip',
}
@Controller('game')
export class GameController {
  constructor(
    private sequelize: Sequelize,
    private cardService: CardService,
    private gameService: GameService,
    private handService: HandService,
    private axiosService: AxoisService,
    private playerService: PlayerService,
    private handCardService: HandCardService,
    private cardSuitService: CardSuitService,
    private gameTableService: GameTableService,
    private handTasksService: HandTasksService,
    private gamePlayerService: GamePlayerService,
    private playerHoleService: PlayerHoleService,
    private handActionService: HandActionService,
    private handWinnerService: HandWinnerService,
    private handDetailService: HandDetailService,
    private handCommunityService: HandCommunityService,
  ) {}

  @Post('sit-in')
  async sitPlayerIn(
    @Body()
    gameInfos: {
      balance: number;
      game_table_id: string;
      player_position: number;
      type: eGameType;
    },
  ) {
    const { game_table_id, type, balance, player_position } = gameInfos;
    if (!game_table_id || !balance)
      throw new IncompleteDataException(gameInfos);
    if (player_position <= 0)
      throw new GameException(
        'Seat position cannot be null or greater than null',
      );

    /*local function start*/
    const createNewGame = async (
      gameData: {
        game_table_id: string;
        type: eGameType;
      },
      playerData: {
        balance: number;
        player_id: string;
      },
    ) => {
      const { game_table_id, type } = gameData;
      const { balance, player_id } = playerData;
      const { game_id } = await this.gameService.create({
        game_table_id,
        type,
      });
      return await this.gamePlayerService.create({
        balance,
        game_id,
        is_in_active_hand: true,
        player_id,
        player_position: 1,
        pseudo: uniqueNamesGenerator({
          dictionaries: [names, languages],
          length: 2,
          separator: '-',
        }),
      });
    };
    const addGamePlayer = async (
      gameData: { game_id: string; number_of_seats: number; started_at: Date },
      playerData: {
        player_position: number;
        player_id: string;
        balance: number;
      },
    ) => {
      const { game_id, number_of_seats, started_at } = gameData;
      const { balance, player_id, player_position } = playerData;
      const players = await this.gamePlayerService.findAll(game_id);
      let position = players.length;
      if (players.length === number_of_seats)
        throw new GameException('No seat available on the table');
      else if (players.length < 2) position += 1;
      else if (player_position >= 2 && player_position <= number_of_seats) {
        if (
          !players.find(
            ({ player_position: taken_position }) =>
              taken_position === player_position,
          )
        )
          position = player_position;
        else throw new GameException('Position already taken');
      } else throw new GameException('Invalid player position');

      return await this.gamePlayerService.create({
        balance,
        game_id,
        player_id,
        player_position: position,
        is_in_active_hand: !Boolean(started_at),
        pseudo: uniqueNamesGenerator({
          dictionaries: [names, languages],
          length: 2,
          separator: '-',
        }),
      });
    };
    /*local function end*/

    const players = await this.playerService.findAll();
    const player = players[randomInt(players.length)];
    if (player) {
      const { player_id } = player;
      const game_table = await this.gameTableService.findOne(game_table_id);
      if (game_table) {
        const { is_open, number_of_seats, big_blind } = game_table;
        if (balance < big_blind * 4)
          throw new GameException(
            'Sorry, you dont have enough balance to sit in',
          );
        if (is_open) {
          return this.sequelize.transaction(async () => {
            const game = await this.gameService.findTableGame(game_table_id);
            if (game) {
              const { game_id, started_at } = game;
              const gamePlayer = await this.gamePlayerService.findGamePlayer({
                player_id,
                game_id,
              });
              if (gamePlayer) {
                throw new GameException(
                  'Your are already seated at this table',
                );
              } else {
                const player = await addGamePlayer(
                  { game_id, number_of_seats, started_at },
                  { balance, player_id, player_position },
                );
                const seactedPlayers =
                  await this.gamePlayerService.findSeatedPlayers(game_id);
                if (seactedPlayers.length === number_of_seats) {
                  await this.gameTableService.update(game_table_id, {
                    is_open: false,
                  });
                  let gameData = {};
                  if (!started_at) {
                    gameData = await this.startGame(game_id);
                  }
                  return { player, ...gameData };
                }
                return { player };
              }
            } else {
              return {
                player: await createNewGame(
                  { game_table_id, type },
                  { balance, player_id },
                ),
              };
            }
          });
        } else throw new GameException('Cannot seat on closed  table');
      } else throw new GameException('Game table not open or not existing');
    } else throw new GameException('Player Not allow');
  }

  // send an arrry of object containing a card_id referenced on the frontend
  @Patch(':game_id/start')
  async startGame(@Param('game_id') game_id: string) {
    if (!game_id) throw new IncompleteDataException({ game_id });
    const game = await this.gameService.findOne(game_id);
    if (!game) throw new UnknwonIDException('game');
    const { started_at, game_table_id } = game;
    if (started_at) throw new GameException('Game is already started');

    const { small_blind, big_blind } = await this.gameTableService.findOne(
      game_table_id,
    );

    return this.sequelize.transaction(async (transaction) => {
      await this.gameService.update(
        game_id,
        {
          started_at: new Date(),
        },
        transaction,
      );
      let handCardValues = [];
      const cards = await this.cardService.shuffleFind(transaction);
      const { hand_id } = await this.handService.create(
        { game_id, hand_number: 1, pot_value: small_blind + big_blind },
        transaction,
      );
      const handCards = await this.handCardService.bulkCreate([
        ...cards.map(({ card_id, card_value, card_suit_id }, position) => {
          handCardValues.push({
            card_id,
            hand_id,
            card_value,
            card_suit_id,
          });
          return {
            card_id,
            hand_id,
            card_position: position + 1,
          };
        }),
      ]);
      const gamePlayers = await this.gamePlayerService.findAll(
        game_id,
        transaction,
      );

      const playerHolesBulkData: {
        game_player_id: string;
        hand_card_id: string;
      }[] = [];
      [...new Array(2)].forEach(() => {
        gamePlayers.forEach(({ game_player_id }) => {
          const { hand_card_id } = handCards[playerHolesBulkData.length];
          playerHolesBulkData.push({
            game_player_id,
            hand_card_id,
          });
        });
      });
      const createdHoles = await this.playerHoleService.bulkCreate(
        playerHolesBulkData,
        transaction,
      );
      const player_holes = createdHoles.map(
        ({ hand_card_id, distributed_at, player_hole_id, game_player_id }) => {
          const _card = handCardValues.find(
            ({ card_id }) =>
              handCards.find(({ hand_card_id: id }) => id === hand_card_id)
                .card_id === card_id,
          );
          this.handCardService.update(
            hand_card_id,
            {
              used_at: new Date(),
              is_used: true,
            },
            transaction,
          );
          return {
            hand_card_id,
            distributed_at,
            game_player_id,
            player_hole_id,
            card_id: _card.card_id,
          };
        },
      );
      const activePlayers = await this.gamePlayerService.findActivePlayers(
        game_id,
        transaction,
      );
      const { game_player_id: active_player } = activePlayers[2];
      const { game_player_id: game_double, balance: game_double_balance } =
        activePlayers[0];
      const {
        game_player_id: big_blind_player_id,
        balance: big_bling_balance,
      } = activePlayers[1];
      //setting game player detail
      const game_detail = await this.handDetailService.create(
        {
          game_double,
          active_player,
          hand_id,
        },
        transaction,
      );

      //decremeting small blind from game double balance
      await this.gamePlayerService.update(
        game_double,
        {
          balance: game_double_balance - small_blind,
        },
        transaction,
      );
      //decremeting big blind from the big bling player balance
      await this.gamePlayerService.update(
        big_blind_player_id,
        {
          balance: big_bling_balance - big_blind,
        },
        transaction,
      );
      return {
        game_detail,
        player_holes,
      };
    });
  }

  //TODO Sit out every player that haven played for two turn
  @Patch('sit-out/:game_player_id')
  async leaveGame(@Param('game_player_id') game_player_id: string) {
    const gamePlayer = await this.gamePlayerService.findOne(game_player_id);
    if (!gamePlayer) throw new UnknwonIDException('game player');

    const { left_game_at, game_id } = gamePlayer;
    if (left_game_at) throw new GameException('Player Not seated');

    await this.gamePlayerService.update(game_player_id, {
      left_game_at: new Date(),
    });
    let gameTable = await this.gameService.findOne(game_id);
    if (!gameTable) throw new UnknwonIDException('game');

    let { game_table_id } = gameTable;
    await this.gameTableService.update(game_table_id, {
      is_open: true,
    });
    return { has_sat_out: true };
  }

  @Put(':game_player_id/play')
  async playHand(
    @Body('hand_id') hand_id: string,
    @Body('action') action: eHandAction,
    @Body('played_amount') played_amount: number,
    @Param('game_player_id') game_player_id: string,
    @Body('hand_detail_id') hand_detail_id: string,
  ) {
    if (!game_player_id || !hand_id || !action || !hand_detail_id)
      throw new IncompleteDataException({
        hand_id,
        action,
        played_amount,
        hand_detail_id,
      });
    let amount_placed = 0;
    let game_winner: {
      game_player_id: string;
      new_balance: number;
      wins?: number;
      ties?: number;
    };
    let new_hand: {
      hand_id: string;
      hand_detail_id: string;
      active_player: string;
    };

    /*local function start*/
    const getTitlePosition = (
      number_of_hands: number,
      number_of_players: number,
      title_first_position: number,
    ) => {
      return (
        ((number_of_hands % number_of_players) + title_first_position - 1) %
        number_of_players
      );
    };

    const fold = async (
      number_players_remaining: number,
      pot_value: number,
      transaction: Transaction,
    ) => {
      if (number_players_remaining === 1) {
        game_winner = {
          ...(await this.handWinnerService.create(
            {
              hand_id,
              game_player_id,
            },
            transaction,
          )),
          new_balance: pot_value,
        };
      }
    };

    const check = async () => {
      if (game_player_id !== active_player)
        throw new GameActionException(
          'Player cannot check. only active player can',
        );
    };

    const call = async (
      player_balance: number,
      last_game_action: { amount_placed: number; hand_action_id: string },
    ) => {
      if (!last_game_action)
        throw new GameActionException('Call action can not be done');
      const { amount_placed: last_amount_placed, hand_action_id } =
        last_game_action;
      if (hand_action_id) {
        if (player_balance > last_amount_placed) {
          console.log(amount_placed);
          amount_placed = last_amount_placed;
        } else throw new GameActionException('Player balance not enough');
      } else throw new GameActionException('Player cannot call');
    };

    const raise = async (
      user_balance: number,
      big_blind: number,
      last_game_action: {
        amount_placed: number;
      },
    ) => {
      let last_amount_placed = last_game_action
        ? last_game_action.amount_placed
        : big_blind;
      const facter = (played_amount - last_amount_placed) % big_blind;
      if (user_balance > played_amount && played_amount > big_blind) {
        if (facter === 0) {
          amount_placed = played_amount;
        } else
          throw new GameActionException(
            'Raise value most be a multiplicator of the big blind in addition with the last amount bet in',
          );
      } else throw new GameActionException('Player balance not enough');
    };

    const bet = async (user_balance: number, big_blind: number) => {
      if (played_amount) {
        if (user_balance > played_amount && played_amount >= big_blind) {
          amount_placed = played_amount;
        } else throw new GameActionException('Player balance not enough');
      } else throw new IncompleteDataException({ amount_placed });
    };

    const allIn = async (user_balance: number) => {
      return (amount_placed = user_balance);
    };

    const startNewHand = async (
      active_players: GamePlayer[],
      game: {
        game_id: string;
        number_of_hands: number;
      },
      blinds: {
        small_blind: number;
        big_blind: number;
      },
      transaction: Transaction,
    ) => {
      //activate all seated players
      let seactedPlayers = await this.gamePlayerService.findSeatedPlayers(
        hand_id,
        transaction,
      );
      const { big_blind, small_blind } = blinds;
      const { game_id, number_of_hands } = game;
      for (let i = 0; i < seactedPlayers.length; i++) {
        const { balance, game_player_id } = seactedPlayers[i];
        if (balance > big_blind) {
          await this.gamePlayerService.update(
            game_player_id,
            {
              is_in_active_hand: true,
            },
            transaction,
          );
        } else await this.leaveGame(game_player_id);
      }
      seactedPlayers = await this.gamePlayerService.findSeatedPlayers(
        hand_id,
        transaction,
      );
      //end hand
      await this.handService.update(hand_id, { ended_at: new Date() });
      //end game if no player is active
      if (seactedPlayers.length === 0) {
        await this.gameService.update(game_id, {
          ended_at: new Date(),
        });
      }

      await this.gameService.update(
        hand_id,
        {
          number_of_hands,
        },
        transaction,
      );
      //creating a new game hand for the next hand
      const { hand_id: new_hand_id } = await this.handService.create(
        {
          pot_value: big_blind + small_blind,
          hand_number: number_of_hands + 1,
          game_id,
        },
        transaction,
      );
      //updating the game double actual position
      let gameDoubleIndex = getTitlePosition(
        number_of_hands,
        active_players.length,
        1,
      );
      const { game_player_id } = active_players[gameDoubleIndex];
      game_double = game_player_id;

      const { game_player_id: active_player } =
        active_players[(gameDoubleIndex + 2) % active_players.length];
      //updating active player
      const { hand_detail_id: new_hand_detail_id } =
        await this.handDetailService.create(
          {
            hand_id: new_hand_id,
            active_player,
            game_double,
          },
          transaction,
        );
      new_hand = {
        active_player,
        hand_detail_id: new_hand_detail_id,
        hand_id: new_hand_id,
      };
    };

    const autoLeave = async (game_id: string) => {
      const seactedPlayers = await this.gamePlayerService.findSeatedPlayers(
        game_id,
      );
      const hands = await this.handService.findGameHands(game_id, 2);
      for (let i = 0; i < seactedPlayers.length; i++) {
        const playerActions = await this.handActionService.findHandsActions(
          hands.map(({ hand_id }) => hand_id),
        );
        if (playerActions) {
          const playerAction = playerActions.find(
            ({ action }) => action !== 'skip',
          );
          if (!playerAction) await this.leaveGame(game_player_id);
        }
      }
    };
    /*local function end*/

    const game_player_detail = await this.handDetailService.findOne(
      hand_detail_id,
    );
    if (!game_player_detail) throw new UnknwonIDException('game player detail');
    let { active_player, game_double } = game_player_detail;
    if (active_player !== game_player_id)
      throw new GameActionException("Is active player's turn to play");

    const hand = await this.handService.findOne(hand_id);
    if (!hand) throw new UnknwonIDException('game hand');
    if (hand) {
      if (!hand.started_at)
        throw new GameException('Game hand have not yet started');
      if (hand.ended_at) throw new GameException('Game Hand already ended');
      let { pot_value, status: hand_status, game_id } = hand;
      const game = await this.gameService.findOne(game_id);
      let { number_of_hands, game_table_id } = game;

      const activePlayers = await this.gamePlayerService.findActivePlayers(
        hand_id,
      );
      const activePlayer = activePlayers.find(
        ({ game_player_id: player_id }) => player_id === game_player_id,
      );

      if (activePlayer) {
        const { balance } = activePlayer;

        const lastAction = await this.handActionService.findLastAction(hand_id);
        if (!lastAction) throw new UnknwonIDException('game action');
        const { hand_action_id, action: last_action } = lastAction;

        const gameTable = await this.gameTableService.findOne(game_table_id);
        if (!gameTable) throw new UnknwonIDException('table');
        const { big_blind, small_blind } = gameTable;

        return this.sequelize.transaction(async (transaction) => {
          switch (action) {
            case 'call':
              await call(balance, { amount_placed, hand_action_id });
              break;
            case 'bet':
              await bet(balance, big_blind);
              break;
            case 'fold':
              await fold(activePlayers.length, pot_value, transaction);
              break;
            case 'raise':
              await raise(balance, big_blind, { amount_placed });
              break;
            case 'check':
              await check();
              break;
            case 'all_in':
              await allIn(balance);
              break;
            default: {
              if (last_action !== 'skip')
                throw new GameActionException('Player action not handled yet');
            }
          }
          await this.gamePlayerService.update(game_player_id, {
            is_in_active_hand: action !== 'fold',
            balance: balance - amount_placed,
            transaction,
          });
          await this.handService.incrementPotValue(
            hand_id,
            amount_placed,
            transaction,
          );
          const game_action = await this.handActionService.create(
            {
              hand_id,
              action,
              hand_status,
              amount_placed,
              game_player_id,
            },
            transaction,
          );

          let game_communities: HandCommunity[] = [];
          const { game_player_id: lastPlayerId } =
            activePlayers[activePlayers.length - 1];
          if (activePlayer.game_player_id === lastPlayerId) {
            //game status update
            let gameFreeCards = await this.handCardService.findFreeCards(
              hand_id,
              transaction,
            );
            if (hand_status === 'pre-flop') {
              const cm_cardsBulk = gameFreeCards
                .slice(0, 3)
                .map(({ hand_card_id }) => {
                  this.handCardService.update(
                    hand_card_id,
                    {
                      used_at: new Date(),
                      is_used: true,
                    },
                    transaction,
                  );
                  return {
                    hand_card_id,
                    hand_id,
                  };
                });
              game_communities = await this.handCommunityService.bulkCreate(
                cm_cardsBulk,
                transaction,
              );
            } else if (['flop', 'turn'].includes(hand_status)) {
              const { hand_card_id } = gameFreeCards[0];
              game_communities.push(
                await this.handCommunityService.create(
                  {
                    hand_card_id,
                    hand_id,
                  },
                  transaction,
                ),
              );
              await this.handCardService.update(
                hand_card_id,
                {
                  used_at: new Date(),
                  is_used: true,
                },
                transaction,
              );
            } else if (hand_status === 'river') {
              game_winner = await this.getHandWinner(
                hand_id,
                activePlayers,
                transaction,
              );
              //automatic game leave
              await autoLeave(game_id);
              //new hand init
              await startNewHand(
                activePlayers,
                { number_of_hands: number_of_hands + 1, game_id },
                { small_blind, big_blind },
                transaction,
              );
            }

            const gameStatus =
              hand_status === 'pre-flop'
                ? 'flop'
                : hand_status === 'flop'
                ? 'turn'
                : hand_status === 'turn'
                ? 'river'
                : 'show-down';
            await this.handService.update(
              hand_id,
              {
                status: gameStatus,
              },
              transaction,
            );
          }
          //getting last active player position
          let activePlayerIndex =
            (activePlayers.findIndex(
              ({ game_player_id: id }) => id === game_player_id,
            ) +
              1) %
            activePlayers.length;
          const { game_player_id: active_player } =
            activePlayers[activePlayerIndex];
          const allInAction = await this.handActionService.findAction(
            { hand_id, game_player_id: active_player, action: 'all_in' },
            transaction,
          );
          if (allInAction) {
            return await this.playHand(
              hand_id,
              eHandAction.skip,
              0,
              game_player_id,
              hand_detail_id,
            );
          }
          //updating active player
          await this.handDetailService.update(
            hand_detail_id,
            {
              active_player,
              game_double,
            },
            transaction,
          );
          this.handTasksService.setTasksTimeOut(
            'play_interval',
            30,
            {
              hand_id,
              hand_detail_id,
              game_player_id: active_player,
            },
            this.playHand,
          );
          return { game_action, game_winner, game_communities, new_hand };
        });
      } else throw new UnknwonIDException('game player');
    } else throw new UnknwonIDException('game');
  }

  async getHandWinner(
    game_id: string,
    activePlayers: GamePlayer[],
    transaction: Transaction,
  ) {
    const table = new TexasHoldem();
    let cards = await this.cardService.findAll(transaction);
    let cardSuits = await this.cardSuitService.findAll(transaction);
    let handCards = await this.handCardService.findAll(game_id, transaction);

    const getCardString = (hand_card_id: string) => {
      let { card_id } = handCards.find(
        ({ hand_card_id: id }) => id === hand_card_id,
      );
      let { card_value, card_suit_id } = cards.find(
        ({ card_id: id }) => id === card_id,
      );
      let { suit_value } = cardSuits.find(
        ({ card_suit_id: id }) => id === card_suit_id,
      );
      return `${card_value}${suit_value.toLowerCase()}`;
    };

    for (let i = 0; i < activePlayers.length; i++) {
      const { game_player_id } = activePlayers[i];
      const playerHoles = await this.playerHoleService.findAll(
        {
          game_player_id,
        },
        transaction,
      );
      const iHands = playerHoles.map(({ hand_card_id }) => {
        return getCardString(hand_card_id);
      });
      table.addPlayer([iHands[0], iHands[1]]);
    }

    let gameCommunities = await this.handCommunityService.findAll(
      game_id,
      transaction,
    );
    let boardCards = gameCommunities.map(({ hand_card_id }) => {
      return getCardString(hand_card_id);
    });
    table.setBoard(boardCards);
    const result = table.calculate();
    const playersWins = result.getPlayers().map((player) => {
      return {
        name: player.getName(),
        wins: player.getWinsPercentageString(),
        ties: player.getTiesPercentageString(),
      };
    });
    let winners = playersWins.map(({ name, wins, ties }) => ({
      index: parseInt(name.split('#')[1]),
      wins: Number(wins.split('%')[0]),
      ties: Number(ties.split('%')[0]),
    }));

    winners = winners.sort(
      ({ wins: a_wins }, { wins: b_wins }) => a_wins - b_wins,
    );
    let { index, wins, ties } = winners[winners.length - 1];
    const { pot_value } = await this.handService.findLastest(
      game_id,
      transaction,
    );
    const { game_player_id, balance } = activePlayers[index];
    let new_balance = balance + pot_value;
    await this.gamePlayerService.update(
      game_player_id,
      {
        balance: new_balance,
      },
      transaction,
    );
    return { game_player_id, new_balance, wins, ties };
  }

  @Put(':game_player_id/force-sit-in')
  async forcePlayerSitIn(@Param('game_player_id') game_player_id: string) {
    if (!game_player_id) throw new IncompleteDataException({ game_player_id });
    let gamePlayer = await this.gamePlayerService.findOne(game_player_id);
    if (!gamePlayer) throw new UnknwonIDException('game player');

    let { balance, game_id } = gamePlayer;
    const { game_table_id } = await this.gameService.findOne(game_id);
    const { big_blind, small_blind } = await this.gameTableService.findOne(
      game_table_id,
    );
    let hand = await this.handService.findLastest(game_id);
    if (!hand) throw new GameException('Game has no hand started yet');
    const { hand_id } = hand;

    let playerAction = await this.handActionService.findOne({
      hand_id,
      game_player_id,
    });
    if (!playerAction) {
      if (balance > big_blind) balance = balance - big_blind;
      else throw new GameException('Player Balance not enough');
    } else {
      const dead_blind = small_blind + big_blind;
      if (balance > dead_blind) balance = balance - dead_blind;
      else throw new GameException('Player Balance not enough');
    }
    return this.sequelize.transaction(async (transaction) => {
      await this.gamePlayerService.update(
        game_player_id,
        {
          is_in_active_hand: true,
        },
        transaction,
      );
      await this.gamePlayerService.update(
        game_player_id,
        {
          balance,
        },
        transaction,
      );
      return { is_player_active: true };
    });
  }
}
