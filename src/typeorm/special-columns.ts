import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  PrimaryGeneratedColumn,
  Generated,
} from "typeorm";

export class TypeOrmColumns {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: number;
}

export class CustomColumns extends TypeOrmColumns {
  @Column({ default: false, select: false })
  disabled: boolean;
}

export class DefaultAndCustomColumns extends CustomColumns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated("uuid")
  aliasId: string;
}
