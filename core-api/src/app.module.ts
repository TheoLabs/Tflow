import { Module } from '@nestjs/common';
import { ConfigsModule } from '@configs';
import { GlobalDomainModule } from './modules/global-domain.module';
import { DatabasesModule } from '@databases';

@Module({
  imports: [ConfigsModule, DatabasesModule, GlobalDomainModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
