import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigsService } from '@configs';
import entities from './entities';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigsService],
      useFactory: (configsService: ConfigsService) => ({
        ...configsService.mysql,
        entities,
      }),
    }),
  ],
})
export class TypeormModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TypeOrmModule.name);

  constructor(private readonly datasource: DataSource) {}

  onModuleInit() {
    if (this.datasource.isInitialized) {
      this.logger.log('mysql is connected successfully. ✅');
    } else {
      this.logger.error('mysql connection failed. ❌');
    }
  }

  onModuleDestroy() {
    if (this.datasource.isInitialized) {
      this.logger.log('mysql connection closed. ☑️');
    } else {
      this.logger.error('mysql connection failed to close. ❌');
    }
  }
}
