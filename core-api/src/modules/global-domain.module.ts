import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MemberModule } from './member/member.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [HealthModule, MemberModule, RoleModule],
  exports: [HealthModule, MemberModule, RoleModule],
})
export class GlobalDomainModule {}
