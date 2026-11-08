import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigsModule } from '@configs';
import { GlobalDomainModule } from '@modules/global-domain.module';
import { DatabasesModule } from '@databases';
import { ContextMiddleware, UUIDMiddleware } from '@middlewares';
import { ContextModule } from '@libs/context';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggerInterceptor } from '@libs/interceptors';
import { ExceptionFilter } from '@libs/filters';

@Module({
  imports: [ConfigsModule, DatabasesModule, ContextModule, GlobalDomainModule],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggerInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware, UUIDMiddleware).forRoutes('*');
  }
}
