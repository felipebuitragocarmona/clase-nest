# Guía NestJS paso a paso — Cinema API

Guía de implementación **paso a paso** para construir una API REST de cine con **NestJS**, **TypeORM** y **MySQL**, incluyendo relaciones entre entidades, validaciones, migraciones y seguridad mediante Guards.

---

## Tabla de Contenidos

1. [Paso 1 — Creación del proyecto](#1-paso-1--creación-del-proyecto)
2. [Paso 2 — Arquitectura del Framework](#2-paso-2--arquitectura-del-framework)
3. [Configuración de Base de Datos (MySQL)](#3-configuración-de-base-de-datos-mysql)
4. [Configuración del Entorno y Conexión](#4-configuración-del-entorno-y-conexión)
5. [Generación de Recursos (CLI)](#5-generación-de-recursos-cli)
6. [Definición de Entidades y Relaciones](#6-definición-de-entidades-y-relaciones)
7. [Validaciones (DTOs)](#7-validaciones-dtos)
8. [Lógica de Negocio (CRUD)](#8-lógica-de-negocio-crud---completo)
9. [Migraciones](#9-migraciones)
10. [Seguridad (Guards)](#10-seguridad-guards)
11. [Implementar WebSocket (paso a paso y archivos a modificar)](#11-implementar-websocket-paso-a-paso-y-archivos-a-modificar)
12. [CRUD en Nest con Mapper (lógica tipo 1_1 Primer CRUD)](#12-crud-en-nest-con-mapper-lógica-tipo-1_1-primer-crud)

---

## 1. Paso 1 — Creación del proyecto

### 1.1. Pre-requisitos

Se requiere tener instalado **Node.js** (versión LTS recomendada).

### 1.2. Instalar el CLI de NestJS

```bash
npm i -g @nestjs/cli
```

### 1.3. Crear el proyecto

```bash
nest new demo-cinema
```

### 1.4. Entrar a la carpeta del proyecto

```bash
cd demo-cinema
```

### 1.5. Instalar dependencias base del tutorial

Instalamos TypeORM, MySQL, validadores y el paquete `mapped-types` para evitar errores en tipos parciales.

```bash
npm install --save @nestjs/typeorm typeorm mysql2 @nestjs/config class-validator class-transformer axios --force
npm i @nestjs/mapped-types --force
```

---

## 2. Paso 2 — Arquitectura del Framework

NestJS opera bajo una arquitectura modular y escalable. Antes de iniciar la implementación, es fundamental comprender los componentes base adaptados al nuevo modelo de negocio:

| Componente | Descripción |
|---|---|
| **Módulos (Modules)** | Agruparemos la lógica por dominios: `MoviesModule`, `TheatersModule`, `ScreeningsModule`, `ProjectorsModule`, `SeatsModule`. |
| **Controladores (Controllers)** | Manejarán las rutas (ej: `POST /screenings` para programar una función). |
| **Servicios (Providers/Services)** | Contendrán la lógica, como validar que una película exista antes de crear una función. |
| **DTO (Data Transfer Objects)** | Definirán qué datos se envían (ej: `movie_id` y `theater_id` para crear una `Screening`). |
| **Entidades (Entities)** | Mapeo ORM de las tablas: `Movie`, `Screening`, `Theater`, `Projector`, `Seat`. |
| **Guards** | Autorización mediante microservicio externo. |

---

## 3. Configuración de Base de Datos (MySQL)

Ejecuta este script en tu cliente SQL (Workbench/DBeaver):

```sql
-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS cinema_db;

-- 2. Crear el usuario
CREATE USER IF NOT EXISTS 'admin_cine'@'localhost' IDENTIFIED BY 'cine123';

-- 3. Asignar privilegios
GRANT ALL PRIVILEGES ON cinema_db.* TO 'admin_cine'@'localhost';

FLUSH PRIVILEGES;
```

---

## 4. Configuración del Entorno y Conexión

### 4.1. Archivo `.env`

Crea un archivo `.env` en la raíz del proyecto:

```ini
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin_cine
DB_PASS=cine123
DB_NAME=cinema_db
MS_SECURITY=http://localhost:8080
```

### 4.2. Archivo `typeorm.config.ts`

Crea este archivo en la raíz para las migraciones:

```typescript
import { DataSource } from 'typeorm';
import 'dotenv/config'; // Carga las variables del archivo .env

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // Para CLI (ts-node) y para runtime compilado (dist)
  entities: ['src/**/*.entity{.ts,.js}', 'dist/**/*.entity.js'],
  migrations: ['src/migrations/*{.ts,.js}', 'dist/migrations/*.js'],
  synchronize: false,
});

export default dataSource;
```

### 4.3. Configuración del `AppModule`

En `src/app.module.ts`, importamos los nuevos módulos del diagrama:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
  ],
})
export class AppModule {}
```

---

## 5. Generación de Recursos (CLI)

Generamos los recursos basados en el nuevo diagrama:

```bash
nest g resource movies
nest g resource theaters
nest g resource projectors
nest g resource seats
nest g resource screenings
```

---

## 6. Definición de Entidades y Relaciones

Relaciones reflejadas en el diagrama:

- **Theater → Projector:** `1:1`
- **Theater → Seat:** `1:N`
- **Movie → Screening:** `1:N`
- **Theater → Screening:** `1:N` (Una sala tiene muchas funciones)

### 6.1. Entidad `Projector` (1:1 Inversa)

`src/projectors/entities/projector.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Theater } from '../../theaters/entities/theater.entity';

@Entity('projectors')
export class Projector {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  brand!: string;

  @Column()
  high!: number;

  @Column()
  width!: number;

  @OneToOne(() => Theater, (theater) => theater.projector)
  theater!: Theater;
}
```

### 6.2. Entidad `Seat` (N:1)

`src/seats/entities/seat.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Theater } from '../../theaters/entities/theater.entity';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  location!: string;

  @Column()
  reclining!: boolean;

  @ManyToOne(() => Theater, (theater) => theater.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theater_id' })
  theater!: Theater;
}
```

### 6.3. Entidad `Movie` (Padre)

`src/movies/entities/movie.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Screening } from '../../screenings/entities/screening.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  duration!: number; // minutos

  @Column({ type: 'date' })
  date!: Date;

  @OneToMany(() => Screening, (screening) => screening.movie)
  screenings!: Screening[];
}
```

### 6.4. Entidad `Screening` (Tabla Intermedia con datos)

`src/screenings/entities/screening.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { Theater } from '../../theaters/entities/theater.entity';

@Entity('screenings')
export class Screening {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'datetime' })
  date!: Date;

  @ManyToOne(() => Movie, (movie) => movie.screenings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie!: Movie;

  @ManyToOne(() => Theater, (theater) => theater.screenings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theater_id' })
  theater!: Theater;
}
```

### 6.5. Entidad `Theater` (Principal)

`src/theaters/entities/theater.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Projector } from '../../projectors/entities/projector.entity';
import { Seat } from '../../seats/entities/seat.entity';
import { Screening } from '../../screenings/entities/screening.entity';

@Entity('theaters')
export class Theater {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  location!: string;

  @Column()
  capacity!: number;

  @OneToOne(() => Projector, (projector) => projector.theater, { cascade: true })
  @JoinColumn({ name: 'projector_id' })
  projector!: Projector;

  @OneToMany(() => Seat, (seat) => seat.theater, { cascade: true })
  seats!: Seat[];

  @OneToMany(() => Screening, (screening) => screening.theater)
  screenings!: Screening[];
}
```

---

## 7. Validaciones (DTOs)

Configura validación global en `src/main.ts`:

```typescript
const app = await NestFactory.create(AppModule);
// Esta línea es nueva
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
//-------
 await app.listen(process.env.PORT ?? 3000);
```

### DTO Creación de `Screening`

`src/screenings/dto/create-screening.dto.ts`

Este DTO es vital para conectar `Movie` y `Theater` mediante sus IDs:

```typescript
import { IsInt, IsNotEmpty, IsISO8601 } from 'class-validator';

export class CreateScreeningDto {
  @IsISO8601()
  date!: string; // "2024-10-20T18:00:00Z"

  @IsInt()
  @IsNotEmpty()
  movie_id!: number;

  @IsInt()
  @IsNotEmpty()
  theater_id!: number;
}
```

---

## 8. Lógica de Negocio (CRUD) — Completo

Esta sección contiene la implementación crítica para evitar errores de dependencias.

### 8.1. Registro de Repositorios en Módulos ⚠️ IMPORTANTE

Para que el servicio de `Screenings` pueda acceder a `Movies` y `Theaters`, debemos usar `forFeature` con las tres entidades.

**`src/screenings/screenings.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreeningsService } from './screenings.service';
import { ScreeningsController } from './screenings.controller';
import { Screening } from './entities/screening.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Theater } from '../theaters/entities/theater.entity';

@Module({
  // AQUÍ SE INYECTAN LOS REPOSITORIOS
  imports: [TypeOrmModule.forFeature([Screening, Movie, Theater])],
  controllers: [ScreeningsController],
  providers: [ScreeningsService],
})
export class ScreeningsModule {}
```

**`src/theaters/theaters.module.ts`**

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Theater])],
  controllers: [TheatersController],
  providers: [TheatersService],
})
export class TheatersModule {}
```

**Nota:**  Debe hacerse lo mismo para las demás entidades

### 8.2. Implementación de Servicios Completos

**`src/theaters/theaters.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theater } from './entities/theater.entity';
import { CreateTheaterDto } from './dto/create-theater.dto';

@Injectable()
export class TheatersService {
  constructor(
    @InjectRepository(Theater)
    private readonly theaterRepository: Repository<Theater>,
  ) { }

  async create(createTheaterDto: CreateTheaterDto) {
    const theater = this.theaterRepository.create(createTheaterDto);
    return await this.theaterRepository.save(theater);
  }

  async findAll() {
    return await this.theaterRepository.find({
      relations: ['projector', 'seats', 'screenings'],
    });
  }

  async findOne(id: number) {
    const theater = await this.theaterRepository.findOne({
      where: { id },
      relations: ['projector', 'seats', 'screenings'],
    });

    if (!theater) throw new NotFoundException(`Teatro #${id} no encontrado`);
    return theater;
  }
  async update(id: number, updateTheaterDto: Partial<CreateTheaterDto>) {
    const theater = await this.findOne(id); // reutiliza validación

    const updated = Object.assign(theater, updateTheaterDto);

    return await this.theaterRepository.save(updated);
  }

  async remove(id: number) {
    const theater = await this.findOne(id); // asegura que exista

    await this.theaterRepository.remove(theater);

    return { message: `Teatro #${id} eliminado correctamente` };
  }
}
```

**`src/screenings/screenings.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { Screening } from './entities/screening.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { Theater } from '../../theaters/entities/theater.entity';

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectRepository(Screening) private screeningRepo: Repository<Screening>,
    @InjectRepository(Movie) private movieRepo: Repository<Movie>,
    @InjectRepository(Theater) private theaterRepo: Repository<Theater>,
  ) {}

  async create(dto: CreateScreeningDto) {
    // 1. Buscamos la película
    const movie = await this.movieRepo.findOneBy({ id: dto.movie_id });
    if (!movie) throw new NotFoundException('Película no encontrada');

    // 2. Buscamos el teatro
    const theater = await this.theaterRepo.findOneBy({ id: dto.theater_id });
    if (!theater) throw new NotFoundException('Teatro no encontrado');

    // 3. Creamos la relación
    const screening = this.screeningRepo.create({
      date: new Date(dto.date),
      movie: movie,
      theater: theater,
    });

    return await this.screeningRepo.save(screening);
  }

  async findAll() {
    return await this.screeningRepo.find({
      relations: ['movie', 'theater'], // Trae los datos relacionados
    });
  }

  async findOne(id: number) {
    const screening = await this.screeningRepo.findOne({
      where: { id },
      relations: ['movie', 'theater'],
    });

    if (!screening) throw new NotFoundException(`Función #${id} no encontrada`);
    return screening;
  }
}
```

### 8.3. Controladores

**`src/theaters/theaters.controller.ts`**

```typescript

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TheatersService } from './theaters.service';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';

@Controller('theaters')
export class TheatersController {
  constructor(private readonly theatersService: TheatersService) {}

  @Post()
  create(@Body() createTheaterDto: CreateTheaterDto) {
    return this.theatersService.create(createTheaterDto);
  }

  @Get()
  findAll() {
    return this.theatersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.theatersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTheaterDto: UpdateTheaterDto) {
    return this.theatersService.update(+id, updateTheaterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.theatersService.remove(+id);
  }
}

```

**`src/screenings/screenings.controller.ts`**

```typescript
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ScreeningsService } from './screenings.service';
import { CreateScreeningDto } from './dto/create-screening.dto';

@Controller('screenings')
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Post()
  create(@Body() createScreeningDto: CreateScreeningDto) {
    return this.screeningsService.create(createScreeningDto);
  }

  @Get()
  findAll() {
    return this.screeningsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.screeningsService.findOne(id);
  }
}
```

---

## 9. Migraciones

### Generar Migración

```bash
npx typeorm-ts-node-commonjs migration:generate ./src/migrations/InitCinemaSchema -d ./typeorm.config.ts
```

### Ejecutar Migración

```bash
npx typeorm-ts-node-commonjs migration:run -d ./typeorm.config.ts
```

### Correr el Proyecto

```bash
npm run start
```

### Prueba en Postman

Gracias a que configuramos `cascade: true` en la entidad `Theater`, podemos crear el teatro, el proyector y los asientos **en una sola petición**.

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `http://localhost:3000/theaters` |

**Body (JSON):**

```json
{
  "location": "Sala IMAX - Centro Mayor",
  "capacity": 150,
  "projector": {
    "brand": "Sony Digital Cinema 4K",
    "width": 4096,
    "high": 2160
  },
  "seats": [
    { "location": "A1", "reclining": true },
    { "location": "A2", "reclining": true },
    { "location": "B1", "reclining": false }
  ]
}
```

---

## 10. Seguridad (Guards)

### Implementación del Guard

`src/common/guards/security.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger('SecurityGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { headers, url, method } = request;

    if (!headers.authorization) {
      throw new UnauthorizedException('Token de autorización faltante');
    }

    const token = headers.authorization.replace('Bearer ', '');
    const permissionData = { url, method };

    try {
      const securityUrl = `${process.env.MS_SECURITY}/api/public/security/permissions-validation`;
      const response = await axios.post(securityUrl, permissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data === true) return true;
      else throw new UnauthorizedException('Permisos insuficientes');
    } catch (error) {
      this.logger.error(`Error auth: ${error.message}`);
      throw new UnauthorizedException('Acceso denegado');
    }
  }
}
```

### Registro Global (protege TODO por defecto)

En `src/app.module.ts`, registra el guard globalmente:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { SecurityGuard } from './common/guards/security.guard';

@Module({
  providers: [{ provide: APP_GUARD, useClass: SecurityGuard }],
})
export class AppModule {}
```

> ⚠️ Reiniciar el servidor después de aplicar este cambio y volver a probar los endpoints.

---

## 11. Implementar WebSocket (paso a paso y archivos a modificar)

Si quieres agregar notificaciones en tiempo real con Socket.IO, estos son los archivos exactos que debes tocar:

### Paso 1: Verificar dependencias

**Archivo:** `package.json`

Confirma que estén instaladas estas dependencias:

- `@nestjs/websockets`
- `@nestjs/platform-socket.io`
- `socket.io`

Si no están, instálalas:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

Referencia de cómo deben verse en `dependencies`:

```json
{
  "dependencies": {
    "@nestjs/platform-socket.io": "^11.1.19",
    "@nestjs/websockets": "^11.1.19",
    "socket.io": "^4.8.3"
  }
}
```

### Paso 2: Crear el gateway de notificaciones

**Archivo:** `src/gateways/notifications/notifications.gateway.ts`

Código sugerido:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server?: Server;

  handleConnection(client: Socket) {
    const query = client.handshake.query;
    console.log(`Nuevo dispositivo conectado: ${client.id}`);
    console.log('Query del socket:', JSON.stringify(query));

    client.emit('new_notification', { hello: 'world' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Dispositivo desconectado: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any): string {
    console.log('Mensaje recibido:', data);
    return 'Mensaje recibido correctamente';
  }

  broadcastNotification(payload: { event: string; data: unknown }) {
    this.server?.emit(payload.event, payload.data);
  }
}
```

### Paso 3: Encapsular el gateway en un módulo

**Archivo:** `src/gateways/notifications/notifications.module.ts`

Código:

```typescript
import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
```

### Paso 4: Importar el módulo en la app principal

**Archivo:** `src/app.module.ts`

Importa y registra el módulo:

```typescript
import { NotificationsModule } from './gateways/notifications/notifications.module';

@Module({
  imports: [
    // ...otros módulos
    NotificationsModule,
  ],
})
export class AppModule {}
```

### Paso 5: Emitir eventos desde tu lógica de negocio

**Archivos a modificar (según dónde ocurra la acción de negocio):**

- `src/screenings/screenings.service.ts`
- `src/theaters/theaters.service.ts`
- `src/movies/movies.service.ts`
- u otro servicio donde quieras disparar la notificación

Ejemplo en `src/screenings/screenings.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Screening } from './entities/screening.entity';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { NotificationsGateway } from '../gateways/notifications/notifications.gateway';

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectRepository(Screening)
    private readonly screeningsRepository: Repository<Screening>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createScreeningDto: CreateScreeningDto) {
    const screening = this.screeningsRepository.create(createScreeningDto);
    const saved = await this.screeningsRepository.save(screening);

    this.notificationsGateway.broadcastNotification({
      event: 'new_notification',
      data: {
        message: 'Nueva función creada',
        screeningId: saved.id,
      },
    });

    return saved;
  }
}
```

### Paso 6: Probar la conexión del cliente

Puedes usar:

- **Script cliente:** `clientSocket.py`
- o un cliente Socket.IO (Postman WS, frontend web, app móvil, etc.)

Ejemplo mínimo de cliente en Python:

```python
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('Conectado al servidor')
    sio.emit('message', {'from': 'python-client', 'text': 'hola desde cliente'})

@sio.event
def disconnect():
    print('Desconectado del servidor')

@sio.on('new_notification')
def on_new_notification(data):
    print('Notificación recibida:', data)

sio.connect('http://localhost:3000', transports=['websocket'])
sio.wait()
```

Conéctate al servidor y valida que:

1. Recibes el evento de bienvenida (`new_notification`).
2. Puedes enviar el evento `message`.
3. Se reciben emisiones cuando ocurre una acción de negocio (por ejemplo, crear una función).

### Resumen rápido de archivos

1. `package.json` (dependencias WebSocket)
2. `src/gateways/notifications/notifications.gateway.ts` (lógica del socket)
3. `src/gateways/notifications/notifications.module.ts` (módulo del gateway)
4. `src/app.module.ts` (registro del módulo)
5. `src/**/*.service.ts` (disparar eventos desde negocio)
6. `clientSocket.py` (prueba del cliente)

---

## 12. CRUD en Nest con Mapper (lógica tipo 1_1 Primer CRUD)

Esta sección replica la misma lógica pedagógica de `Entity + Repository + DTO + Mapper + Service + Controller`, pero aplicada a NestJS.

### 12.1 Flujo de arquitectura

```text
REQUEST
   │
   ▼
Controller
   │
   ▼
DTOs (entrada)
   │
   ▼
Service
 ┌─┴─────────────┐
 ▼               ▼
Mapper       Repository (TypeORM)
 │               │
 ▼               ▼
DTOs (salida)   Entity
                  │
                  ▼
                 MySQL
```

### 12.2 Estructura sugerida para `movies`

```text
src/movies
├── dto
│   ├── base-movie.dto.ts
│   ├── create-movie.dto.ts
│   ├── update-movie.dto.ts
│   └── movie-response.dto.ts
├── entities
│   └── movie.entity.ts
├── mappers
│   └── movie.mapper.ts
├── movies.controller.ts
├── movies.service.ts
└── movies.module.ts
```

### 12.3 Entity

**Archivo:** `src/movies/entities/movie.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Screening } from '../../screenings/entities/screening.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  duration!: number;

  @Column({ type: 'date' })
  date!: Date;

  @OneToMany(() => Screening, (screening) => screening.movie)
  screenings!: Screening[];
}
```

### 12.4 DTOs (entrada y salida)

**Archivo:** `src/movies/dto/base-movie.dto.ts`

```typescript
import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export abstract class BaseMovieDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsDateString({}, { message: 'date must be a valid ISO date (YYYY-MM-DD)' })
  date!: string;
}
```

**Archivo:** `src/movies/dto/create-movie.dto.ts`

```typescript
import { BaseMovieDto } from './base-movie.dto';

export class CreateMovieDto extends BaseMovieDto {}
```

**Archivo:** `src/movies/dto/update-movie.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
```

**Archivo:** `src/movies/dto/movie-response.dto.ts`

```typescript
export class MovieResponseDto {
  id!: number;
  name!: string;
  duration!: number;
  date!: string;
}
```

### 12.5 Mapper

**Archivo:** `src/movies/mappers/movie.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { MovieResponseDto } from '../dto/movie-response.dto';
import { Movie } from '../entities/movie.entity';

@Injectable()
export class MovieMapper {
  toEntity(dto: CreateMovieDto): Movie {
    return {
      name: dto.name,
      duration: dto.duration,
      date: new Date(dto.date),
      screenings: [],
    } as Movie;
  }

  mergeEntity(entity: Movie, dto: UpdateMovieDto): Movie {
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.duration !== undefined) entity.duration = dto.duration;
    if (dto.date !== undefined) entity.date = new Date(dto.date);
    return entity;
  }

  toResponseDto(entity: Movie): MovieResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      duration: entity.duration,
      date: entity.date.toISOString().slice(0, 10),
    };
  }

  toResponseDtoList(entities: Movie[]): MovieResponseDto[] {
    return entities.map((movie) => this.toResponseDto(movie));
  }
}
```

### 12.6 Repository en Nest (equivalente al `UserRepository`)

En Nest + TypeORM normalmente no creas una interfaz `Repository` manual para CRUD básico.
El repositorio aparece al inyectar `Repository<Movie>` en el servicio y registrar la entidad en `TypeOrmModule.forFeature([Movie])`.

### 12.7 Service con lógica de negocio + mapper

**Archivo:** `src/movies/movies.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { Movie } from './entities/movie.entity';
import { MovieMapper } from './mappers/movie.mapper';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly movieMapper: MovieMapper,
  ) {}

  async create(dto: CreateMovieDto): Promise<MovieResponseDto> {
    const entity = this.movieMapper.toEntity(dto);
    const saved = await this.moviesRepository.save(entity);
    return this.movieMapper.toResponseDto(saved);
  }

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.moviesRepository.find();
    return this.movieMapper.toResponseDtoList(movies);
  }

  async findOne(id: number): Promise<MovieResponseDto> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) throw new NotFoundException(`Movie with id ${id} not found`);
    return this.movieMapper.toResponseDto(movie);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<MovieResponseDto> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) throw new NotFoundException(`Movie with id ${id} not found`);

    const merged = this.movieMapper.mergeEntity(movie, dto);
    const saved = await this.moviesRepository.save(merged);
    return this.movieMapper.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) throw new NotFoundException(`Movie with id ${id} not found`);
    await this.moviesRepository.remove(movie);
  }
}
```

### 12.8 Controller

**Archivo:** `src/movies/movies.controller.ts`

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}
```

### 12.9 Module (registro de entidad y mapper)

**Archivo:** `src/movies/movies.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './entities/movie.entity';
import { MovieMapper } from './mappers/movie.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [MoviesService, MovieMapper],
})
export class MoviesModule {}
```

### 12.10 Resumen de responsabilidades (igual que en 1_1)

| Componente | Responsabilidad |
|---|---|
| **Entity** | Representa la tabla `movies` |
| **DTOs** | Definen contratos de entrada/salida |
| **Mapper** | Convierte DTO ↔ Entity |
| **Repository** | Acceso a BD vía TypeORM |
| **Service** | Lógica de negocio y reglas |
| **Controller** | Endpoints HTTP |

Con este patrón, tu CRUD en Nest queda alineado con la lógica de `1_1_PrimerCRUD`, pero usando convenciones de NestJS y TypeORM.

---

*Guía generada para el proyecto Cinema API con NestJS + TypeORM + MySQL.*
