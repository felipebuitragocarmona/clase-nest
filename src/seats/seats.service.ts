import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Seat } from './entities/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async create(createSeatDto: CreateSeatDto) {
    const payload: DeepPartial<Seat> = { ...createSeatDto } as DeepPartial<Seat>;
    if (createSeatDto.theater) payload.theater = { id: createSeatDto.theater } as any;

    const seat = this.seatRepository.create(payload);
    return await this.seatRepository.save(seat);
  }

  async findAll() {
    return await this.seatRepository.find({
      relations: ['theater'], // 👈 útil para ver a qué sala pertenece
    });
  }

  async findOne(id: number) {
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: ['theater'],
    });

    if (!seat) throw new NotFoundException(`Asiento #${id} no encontrado`);
    return seat;
  }

  async update(id: number, updateSeatDto: UpdateSeatDto) {
    const seat = await this.findOne(id);

    const updatedData: DeepPartial<Seat> = { ...updateSeatDto } as DeepPartial<Seat>;
    if ((updateSeatDto as any).theater) updatedData.theater = { id: (updateSeatDto as any).theater } as any;

    const updated = Object.assign(seat, updatedData);
    return await this.seatRepository.save(updated);
  }

  async remove(id: number) {
    const seat = await this.findOne(id);

    await this.seatRepository.remove(seat);

    return { message: `Asiento #${id} eliminado correctamente` };
  }
}