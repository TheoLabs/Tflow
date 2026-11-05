import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ConfigsService } from './configs.service';

function validateUndefinedConfig(config: Record<string, any>) {
  const fullConfig = configuration(config);

  const checkConfig = (obj: Record<string, any>, parentKey = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;

      if (value === undefined || Number.isNaN(value)) {
        throw new Error(`❌ .env 파일의 "${currentKey}" 설정 값이 누락되었습니다.`);
      }

      if (typeof value === 'object' && value !== null) {
        checkConfig(value, currentKey);
      }
    });
  };

  checkConfig(fullConfig);

  return config;
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'local'}`],
      load: [configuration],
      validate: validateUndefinedConfig,
    }),
  ],
  providers: [ConfigsService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
