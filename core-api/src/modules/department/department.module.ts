import { Module } from '@nestjs/common';
import { AdminDepartmentController } from './presentation/admin-department.controller';
import { AdminDepartmentService } from './application/admin-department.service';
import { DepartmentRepository } from './infrastructure/department.repository';
import { MemberModule } from '@modules/member/member.module';

@Module({
  imports: [MemberModule],
  controllers: [AdminDepartmentController],
  providers: [AdminDepartmentService, DepartmentRepository],
  exports: [DepartmentRepository],
})
export class DepartmentModule {}
