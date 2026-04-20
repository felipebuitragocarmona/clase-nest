  import { Injectable, NotFoundException } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CreateMovieDto } from './dto/create-movie.dto';
  import { UpdateMovieDto } from './dto/update-movie.dto';
  import { Movie } from './entities/movie.entity';

  @Injectable()
  export class MoviesService {
    constructor(
      @InjectRepository(Movie)
      private readonly moviesRepository: Repository<Movie>,
    ) { }

    async create(createMovieDto: CreateMovieDto): Promise<Movie> {
      const movie = this.moviesRepository.create({
        ...createMovieDto,
        date: createMovieDto.date ? new Date(createMovieDto.date) : undefined,
      });
      return this.moviesRepository.save(movie);
    }

    findAll(): Promise<Movie[]> {
      return this.moviesRepository.find({ relations: ['screenings'] });
    }

    async findOne(id: number): Promise<Movie> {
      const movie = await this.moviesRepository.findOne({
        where: { id },
        relations: ['screenings', 'screenings.theater.seats', 'screenings.theater.projector'],
      });
      if (!movie) throw new NotFoundException(`Movie with id ${id} not found`);
      return movie;
    }

    async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
      const { date, ...rest } = updateMovieDto;

      const toSave: Partial<Movie> = {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      };

      const movie = await this.moviesRepository.preload({ id, ...toSave });
      if (!movie) throw new NotFoundException(`Movie with id ${id} not found`);
      return this.moviesRepository.save(movie);
    }

    async remove(id: number): Promise<void> {
      const movie = await this.findOne(id);
      await this.moviesRepository.remove(movie);
    }
  }
