import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CardSeeder } from './seeders/seeder.cards';
import { TableSeeder } from './seeders/seeder.tables';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {
    // this.sequelize.sync().then(() => {
      // CardSeeder.up();
      // TableSeeder.up();
    // });
  }
  getHello(): string {
    return 'Hello World!';
  }
}
