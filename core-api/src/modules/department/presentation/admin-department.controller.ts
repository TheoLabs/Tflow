import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminDepartmentService } from '../application/admin-department.service';
import { DepartmentCreateDto } from './dto';

@Controller('admins/departments')
export class AdminDepartmentController {
  constructor(private readonly adminDepartmentService: AdminDepartmentService) {}

  @Post()
  async create(@Body() body: DepartmentCreateDto) {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    await this.adminDepartmentService.create(body);

    // 4. Send response
    return { data: {} };
  }

  @Get()
  async list() {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    // 4. Send response
    return { data: {} };
  }
}
