# Relaciones en NEST JS

Se deben seguir los siguientes pasos:
1. Creación de las entidades aplicando la teoría de propagación de claves foráneas.
2. Crear la migración con el comando:
``` bash
    npx typeorm-ts-node-commonjs migration:generate ./src/migrations/InitCinemaSchema -d ./typeorm.config.ts
```
3. Ejecutar la migración
``` bash
npx typeorm-ts-node-commonjs migration:run -d ./typeorm.config.ts
```
4. Construir los DTO
5. Construir los servicios
6. Verficar los controladores

## Relación 1-1
En el caso de la relación entre `Theater` y `Projector`, especial cuidado en el decorador `@OneToOne`
1. Creación Modelo `projector.entity.ts`
``` ts
import { Theater } from 'src/theaters/entities/theater.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('projectors')
export class Projector {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    brand?: string;

    @Column()
    high?: number;

    @Column()
    width?: number;

    @OneToOne(() => Theater, (theater) => theater.projector)
    @JoinColumn({ name: 'theater_id' })
    theater?: Theater;
}
```

