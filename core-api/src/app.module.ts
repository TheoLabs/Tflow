import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigsModule } from '@configs';
import { GlobalDomainModule } from '@modules/global-domain.module';
import { DatabasesModule } from '@databases';
import { ContextMiddleware, UUIDMiddleware } from '@middlewares';
import { ContextModule } from '@libs/context';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggerInterceptor } from '@libs/interceptors';

@Module({
  imports: [ConfigsModule, DatabasesModule, GlobalDomainModule, ContextModule],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: RequestLoggerInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware, UUIDMiddleware).forRoutes('*');
  }
}
