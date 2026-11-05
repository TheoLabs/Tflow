import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

(async () => {
  const app = await NestFactory.create(AppModule);

  // NOTE: 안전한 종료를 위한 코드 (graceful shutdown)
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
})();
