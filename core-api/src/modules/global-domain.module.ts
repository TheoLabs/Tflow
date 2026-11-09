import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MemberModule } from './member/member.module';
import { RoleModule } from './role/role.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [HealthModule, MemberModule, RoleModule, DepartmentModule],
  exports: [HealthModule, MemberModule, RoleModule, DepartmentModule],
})
export class GlobalDomainModule {}
