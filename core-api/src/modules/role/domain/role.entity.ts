import { DddRootAggregate } from '@libs/ddd';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role extends DddRootAggregate {
  @PrimaryGeneratedColumn()
  id: number;
}
