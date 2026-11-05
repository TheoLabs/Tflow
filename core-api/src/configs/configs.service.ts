import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

@Injectable()
export class ConfigsService {
  constructor(private readonly configService: ConfigService) {}

  get mysql() {
    return this.configService.get<DataSourceOptions>('mysql');
  }
}
