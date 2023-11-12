import { AbstractEntity } from 'src/common/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum TrackerType {
  UP = 'up',
  DOWN = 'down',
}

@Entity({ name: 'tracker' })
export class Tracker extends AbstractEntity {
  @Column({
    length: 10,
  })
  cryptoName: string;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: TrackerType,
  })
  type: TrackerType;

  // email
  // period
}
