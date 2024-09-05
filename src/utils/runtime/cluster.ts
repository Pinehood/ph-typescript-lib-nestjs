import * as cluster from "cluster";
import { cpus } from "os";

export const Cluster = cluster as unknown as cluster.Cluster;

export class AppCluster {
  static clusterize(callback: () => void): void {
    if (Cluster.isPrimary) {
      console.log(`Master process starting on '${process.pid}'`);
      for (let i = 0; i < cpus().length; i++) {
        Cluster.fork();
      }
      Cluster.on("exit", (worker, code, signal) => {
        console.warn(
          `Worker process '${worker.process.pid}' died with code '${code}' and signal '${signal}'. Restarting...`
        );
        Cluster.fork();
      });
    } else {
      console.log(`Cluster process starting on '${process.pid}'`);
      callback();
    }
  }
}
