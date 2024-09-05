import "reflect-metadata";

import { DynamicModule } from "@nestjs/common";

export function removeControllerDependencies(target: any) {
  const controllers = Reflect.getMetadata("controllers", target) as any[];
  if (controllers && controllers.length > 0) {
    Reflect.defineMetadata("controllers", [], target);
  }
}

export function patchControllerPrefix(target: any) {
  const path = Reflect.getMetadata("path", target) as string;
  if (path) {
    Reflect.defineMetadata("path", path.replace("/api/", ""), target);
  }
}

export function removeModule(target: any, module: any) {
  const imports = Reflect.getMetadata("imports", target) as DynamicModule[];
  if (imports && imports.length > 0) {
    Reflect.defineMetadata(
      "imports",
      imports.filter((m) => m.module != module),
      target,
    );
  }
}
