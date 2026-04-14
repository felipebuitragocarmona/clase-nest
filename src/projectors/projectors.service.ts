import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Projector } from './entities/projector.entity';

import { UpdateProjectorDto } from './dto/update-projector.dto';
import { CreateProjectorDto } from './dto/create-projector.dto';
import { TheatersService } from 'src/theaters/theaters.service';

@Injectable()
export class ProjectorsService {
  constructor(
    @InjectRepository(Projector)
    private readonly projectorRepository: Repository<Projector>,
    private readonly theaterService: TheatersService
  ) { }

  async create(createProjectorDto: CreateProjectorDto) {
    if (createProjectorDto.theater) {
      const theater = await this.theaterService
        .findOne(createProjectorDto.theater.id??0)
        .catch(() => null);

      if (!theater) {
        throw new NotFoundException('Theater id not found');
      }
    }
    const projector = this.projectorRepository.create(createProjectorDto);
    return await this.projectorRepository.save(projector);
  }

  async findAll() {
    return await this.projectorRepository.find();
  }

  async findOne(id: number) {
    const projector = await this.projectorRepository.findOne({
      where: { id },
    });

    if (!projector) throw new NotFoundException(`Proyector #${id} no encontrado`);
    return projector;
  }

  async update(id: number, updateProjectorDto: UpdateProjectorDto) {
    const projector = await this.findOne(id);

    if (updateProjectorDto.theater) {
      const theater = await this.theaterService
        .findOne(updateProjectorDto.theater.id??0)
        .catch(() => null);

      if (!theater) {
        throw new NotFoundException('Theater id not found');
      }
    }

    Object.assign(projector, updateProjectorDto);

    return await this.projectorRepository.save(projector);
  }

  async remove(id: number) {
    const projector = await this.findOne(id);

    await this.projectorRepository.remove(projector);

    return { message: `Proyector #${id} eliminado correctamente` };
  }
}