import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theater } from './entities/theater.entity';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';

@Injectable()
export class TheatersService {
  constructor(
    @InjectRepository(Theater)
    private readonly theaterRepository: Repository<Theater>,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  async create(createTheaterDto: CreateTheaterDto) {
    console.log('otro');
    const theater = this.theaterRepository.create(createTheaterDto);
    return await this.theaterRepository.save(theater);
  }
  async createWithNotification(createTheaterDto: CreateTheaterDto) {
    console.log('iniciando');
    const theater =  await this.theaterRepository.save(createTheaterDto);
    console.log('Emitiendo notificación de nuevo teatro:', theater);
    await this.notificationsGateway.broadcastNotification({
      event: 'new_notification',
      data: theater,
    });
    return theater;
  }


  async findAll() {
    return await this.theaterRepository.find(
      {
        relations: ['projector']
      }
    );
  }

  async findOne(id: number) {
    const theater = await this.theaterRepository.findOne({
      where: { id },
      relations: ['projector','seats']
    });

    if (!theater) throw new NotFoundException(`Teatro #${id} no encontrado`);
    return theater;
  }
  async update(id: number, updateTheaterDto: UpdateTheaterDto) {
    const theater = await this.findOne(id); // reutiliza validación

    const updated = Object.assign(theater, updateTheaterDto);

    return await this.theaterRepository.save(updated);
  }

  async remove(id: number) {
    const theater = await this.findOne(id); // asegura que exista

    if (theater.projector) {
      throw new BadRequestException('No se puede eliminar el teatro porque tiene un proyector asociado');
    }

    await this.theaterRepository.remove(theater);

    return { message: `Teatro #${id} eliminado correctamente` };
  }
}