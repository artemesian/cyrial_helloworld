import { Module } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import config from './config/config';
import { Game } from './models/Game';
import { Card } from './models/Card';
import { Player } from './models/Player';
import { AppService } from './app.service';
import { CardSuit } from './models/CardSuit';
import { GameTable } from './models/GameTable';
import { AppController } from './app.controller';
import { GamePlayer } from './models/GamePlayer';
import { GameModule } from './modules/game.module';
import { HandDetail } from './models/HandDetail';
import { LobbyModule } from './modules/lobby.module';
import { HandCard } from './models/HandCard';
import { PlayerHole } from './models/PlayerHole';
import { HandAction } from './models/HandAction';
import { HandWinner } from './models/HandWinner';
import { HandCommunity } from './models/HandCommunity';
import { Hand } from './models/Hand';
import { RewardsModule } from './modules/rewards.module';
import { XpClaim } from './models/XpClaim';
import { GameEventModule } from './modules/game-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DB_NAME,
      define: {
        timestamps: false,
      },
      models: [
        Card,
        Game,
        Hand,
        Player,
        XpClaim,
        HandCard,
        CardSuit,
        GameTable,
        GamePlayer,
        PlayerHole,
        HandAction,
        HandWinner,
        HandDetail,
        HandCommunity,
      ],
    }),
    GameModule,
    LobbyModule,
    RewardsModule,
    GameEventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
