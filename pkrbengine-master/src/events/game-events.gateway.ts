import { Controller } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import {
  IncompleteDataException,
  UnknwonIDException,
} from 'src/exceptions/exception';
import { GamePlayerService } from 'src/services/game-player.service';
import { HandActionService } from 'src/services/hand-action.service';
import { HandCommunityService } from 'src/services/hand-community.service';
import { HandDetailService } from 'src/services/hand-detail.service';
import { HandService } from 'src/services/hand.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameEventGateway {
  constructor(
    private handService: HandService,
    private handActionService: HandActionService,
    private handDetailService: HandDetailService,
    private gamePlayerService: GamePlayerService,
    private handCommunityService: HandCommunityService,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('live-game-socket')
  async getGameUpdates(@MessageBody('hand_id') hand_id: string) {
    this.server.on("connection", (socket) => {
      console.log("hello world! Connexxtion on")
      socket.on("connect", () => {
        console.log("hello world! I am connected")
      })
    })
    if (!hand_id) throw new IncompleteDataException({ hand_id });
    let hand = await this.handService.findOne(hand_id);
    if (hand) throw new UnknwonIDException('hand');
    const { game_id, status, hand_number } = hand;
    let hand_actions = await this.handActionService.findHandsActions([hand_id]);
    hand_actions = hand_actions.sort(
      ({ played_at: a }, { played_at: b }) => b.getUTCDate() - a.getUTCDate(),
    );
    let hand_detail = await this.handDetailService.findByHand(hand_id);
    let players = await this.gamePlayerService.findAll(game_id);
    let community_cards = await this.handCommunityService.findAll(hand_id);
    return {
      status,
      hand_number,
      game_id,
      hand_detail,
      hand_actions,
      players,
      community_cards,
    };
  }
}
