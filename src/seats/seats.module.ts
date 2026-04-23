import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Theater } from 'src/theaters/entities/theater.entity';
import { TheatersModule } from 'src/theaters/theaters.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Theater]), TheatersModule],
  controllers: [SeatsController],
  providers: [SeatsService],
})
export class SeatsModule {}
