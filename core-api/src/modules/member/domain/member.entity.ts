import { DddRootAggregate } from '@libs/ddd';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member extends DddRootAggregate {
  @PrimaryGeneratedColumn()
  id: number;
}
