import { DddRootAggregate } from '@libs/ddd';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type Ctor = {
  name: string;
  parentDepartmentId?: number | null;
  leaderMemberId?: number | null;
};

@Entity()
export class Department extends DddRootAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  parentDepartmentId?: number | null;

  @Column({ type: 'int', nullable: true })
  leaderMemberId?: number | null;

  private constructor(args: Ctor) {
    super();

    if (args) {
      this.name = args.name;
      this.parentDepartmentId = args.parentDepartmentId;
      this.leaderMemberId = args.leaderMemberId;
    }
  }

  static of(args: Ctor) {
    return new Department(args);
  }
}
