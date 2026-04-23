import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheatersModule } from './theaters/theaters.module';
import { ProjectorsModule } from './projectors/projectors.module';
import { SeatsModule } from './seats/seats.module';
import { MoviesModule } from './movies/movies.module';
import { ScreeningsModule } from './screenings/screenings.module';
import { APP_GUARD } from '@nestjs/core';
import { SecurityGuard } from './guards/security/security.guard';
import { NotificationsModule } from './gateways/notifications/notifications.module';

@Module({
  providers: [{ provide: APP_GUARD, useClass: SecurityGuard }],
  imports: [
    NotificationsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Usaremos migraciones
      }),
    }),
    TheatersModule,
    ProjectorsModule,
    SeatsModule,
    MoviesModule,
    ScreeningsModule,
    NotificationsModule,
  ],
})
export class AppModule {}