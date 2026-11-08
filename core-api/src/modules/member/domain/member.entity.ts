import { today } from '@libs/date';
import { DddRootAggregate } from '@libs/ddd';
import type { CalendarDate } from '@libs/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MemberStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'onLeave',
  EXITED = 'exited',
}

type Ctor = {
  name: string;
  email: string;
  employeeNumber: string;
  departmentId: number | null;
  roleId: number | null;
};

@Entity()
export class Member extends DddRootAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  employeeNumber: string;

  @Column({ type: 'enum', enum: MemberStatus })
  status: MemberStatus;

  @Column({ type: 'varchar', length: 50 })
  joinedOn: CalendarDate;

  @Column({ type: 'varchar', length: 50, nullable: true })
  exitedOn?: CalendarDate | null;

  @Column({ type: 'int', nullable: true })
  departmentId?: number | null;

  @Column({ type: 'int', nullable: true })
  roleId?: number | null;

  private constructor(args: Ctor) {
    super();

    if (args) {
      this.name = args.name;
      this.email = args.email;
      this.employeeNumber = args.employeeNumber;
      this.status = MemberStatus.ACTIVE;
      this.joinedOn = today();
      this.departmentId = args.departmentId;
      this.roleId = args.roleId;
    }
  }
}
