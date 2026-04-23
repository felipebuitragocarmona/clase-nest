import { Module } from '@nestjs/common';
import { TheatersService } from './theaters.service';
import { TheatersController } from './theaters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theater } from './entities/theater.entity';
import { Projector } from '../projectors/entities/projector.entity';
import { Seat } from 'src/seats/entities/seat.entity';
import { NotificationsModule } from 'src/gateways/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Theater,Projector,Seat]),NotificationsModule],
  controllers: [TheatersController],
  providers: [TheatersService],
  exports: [TheatersService], // 👈 necesario
})
export class TheatersModule {}
