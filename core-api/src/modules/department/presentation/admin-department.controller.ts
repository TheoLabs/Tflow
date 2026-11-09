import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AdminDepartmentService } from '../application/admin-department.service';
import { AdminDepartmentQueryDto, DepartmentCreateDto } from './dto';

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
  async list(@Query() query: AdminDepartmentQueryDto) {
    // 1. Destructure body, params, query
    const { keyword, ...options } = query;

    // 2. Get context
    // 3. Get result
    const data = await this.adminDepartmentService.list({ keyword }, options);

    // 4. Send response
    return { data };
  }

  @Get('tree')
  async getTree() {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    const data = await this.adminDepartmentService.listTree();

    // 4. Send response
    return { data };
  }
}
