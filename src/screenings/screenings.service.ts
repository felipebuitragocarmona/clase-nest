import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { Screening } from './entities/screening.entity';
import { MoviesService } from '../movies/movies.service';
import { TheatersService } from '../theaters/theaters.service';

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectRepository(Screening)
    private readonly screeningsRepository: Repository<Screening>,

    private readonly moviesService: MoviesService,

    private readonly theatersService: TheatersService,
  ) {}

  private resolveId(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'id' in value) return (value as any).id;
    return undefined;
  }

  async create(createScreeningDto: CreateScreeningDto): Promise<Screening> {
    const movieId = this.resolveId(createScreeningDto.movie);
    const theaterId = this.resolveId(createScreeningDto.theater);

    if (!movieId) throw new BadRequestException('movie id is required');
    if (!theaterId) throw new BadRequestException('theater id is required');

    const movie = await this.moviesService.findOne(movieId);
    if (!movie) throw new NotFoundException(`Movie with id ${movieId} not found`);

    const theater = await this.theatersService.findOne(theaterId);
    if (!theater) throw new NotFoundException(`Theater with id ${theaterId} not found`);

    const screening = this.screeningsRepository.create({
      date: createScreeningDto.date ? new Date(createScreeningDto.date) : undefined,
      movie,
      theater,
    });

    return this.screeningsRepository.save(screening);
  }

  findAll(): Promise<Screening[]> {
    return this.screeningsRepository.find({ relations: ['movie', 'theater'] });
  }

  async findOne(id: number): Promise<Screening> {
    const screening = await this.screeningsRepository.findOne({
      where: { id },
      relations: ['movie', 'theater'],
    });
    if (!screening) throw new NotFoundException(`Screening with id ${id} not found`);
    return screening;
  }

  async update(id: number, updateScreeningDto: UpdateScreeningDto): Promise<Screening> {
    const screening = await this.screeningsRepository.findOne({ where: { id } });
    if (!screening) throw new NotFoundException(`Screening with id ${id} not found`);

    if (updateScreeningDto.date) screening.date = new Date(updateScreeningDto.date as any);

    if (updateScreeningDto.movie) {
      const movieId = this.resolveId(updateScreeningDto.movie);
      if (!movieId) throw new BadRequestException('movie id is required');
      const movie = await this.moviesService.findOne(movieId);
      if (!movie) throw new NotFoundException(`Movie with id ${movieId} not found`);
      screening.movie = movie;
    }

    if (updateScreeningDto.theater) {
      const theaterId = this.resolveId(updateScreeningDto.theater);
      if (!theaterId) throw new BadRequestException('theater id is required');
      const theater = await this.theatersService.findOne(theaterId);
      if (!theater) throw new NotFoundException(`Theater with id ${theaterId} not found`);
      screening.theater = theater;
    }

    await this.screeningsRepository.save(screening);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const screening = await this.findOne(id);
    await this.screeningsRepository.remove(screening);
  }
}
