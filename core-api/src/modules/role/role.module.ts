import { Module } from '@nestjs/common';
import { RoleRepository } from './infrastructure/role.repository';
import { AdminRoleController } from './presentation/admin-role.controller';
import { AdminRoleService } from './application/admin-role.repository';

@Module({
  imports: [],
  controllers: [AdminRoleController],
  providers: [RoleRepository, AdminRoleService],
  exports: [RoleRepository],
})
export class RoleModule {}
