import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreeningsService } from './screenings.service';
import { ScreeningsController } from './screenings.controller';
import { Screening } from './entities/screening.entity';
import { MoviesModule } from 'src/movies/movies.module';
import { TheatersModule } from 'src/theaters/theaters.module';

@Module({
  imports: [TypeOrmModule.forFeature([Screening]), MoviesModule, TheatersModule],
  controllers: [ScreeningsController],
  providers: [ScreeningsService],
})
export class ScreeningsModule {}
