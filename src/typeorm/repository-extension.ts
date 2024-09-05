import { FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

declare module "typeorm/repository/Repository" {
  interface Repository<Entity> {
    findEx(
      options?: FindManyOptions<Entity>,
      withDeleted?: boolean
    ): Promise<Entity[]>;
    findOneEx(
      options: FindOneOptions<Entity>,
      withDeleted?: boolean
    ): Promise<Entity | null>;
    countEx(
      options?: FindManyOptions<Entity>,
      withDeleted?: boolean
    ): Promise<number>;
  }
}

Repository.prototype.findEx = function <Entity>(
  this: Repository<Entity>,
  options?: FindManyOptions<Entity>,
  withDeleted?: boolean
): Promise<Entity[]> {
  if (options) {
    options.loadEagerRelations = null;
    options.withDeleted = null;
    return this.find({ ...options, loadEagerRelations: false, withDeleted });
  } else {
    return this.find({ loadEagerRelations: false, withDeleted });
  }
};

Repository.prototype.findOneEx = function <Entity>(
  this: Repository<Entity>,
  options?: FindOneOptions<Entity>,
  withDeleted?: boolean
): Promise<Entity> {
  if (options) {
    options.loadEagerRelations = null;
    options.withDeleted = null;
    return this.findOne({ ...options, loadEagerRelations: false, withDeleted });
  } else {
    return this.findOne({ loadEagerRelations: false, withDeleted });
  }
};

Repository.prototype.countEx = function <Entity>(
  this: Repository<Entity>,
  options?: FindManyOptions<Entity>,
  withDeleted?: boolean
): Promise<number> {
  if (options) {
    options.loadEagerRelations = null;
    options.withDeleted = null;
    return this.count({ ...options, loadEagerRelations: false, withDeleted });
  } else {
    return this.count({ loadEagerRelations: false, withDeleted });
  }
};
