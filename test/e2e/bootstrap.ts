import express from "express";
import http from "http";
import { createApp } from "../../app/app";
import Logger, { getLogLabel } from "../../app/utils/logger";
import { isMainThread } from "worker_threads";

let app: express.Application;
const port: number | string = process.env.PORT || 3000;
let logger: Logger;
const logLabel: string = getLogLabel(__filename);
let server: http.Server;

const bootstrap = () => {
  app = createApp();
  logger = new Logger();
  server = app
    .listen(port, () => {
      logger.info(`Server listening on port ${port}`, logLabel);
    })
    .on("error", (error: Error) => {
      logger.error(
        `Unable to start server because of ${error.message}`,
        "E2E Bootstrap"
      );
    });
};

const closeServerWithPromise = (server) => {
  return new Promise(function (resolve, reject) {
    server.close((err, result) => {
      if (err) return reject(err);
      logger.info("closed server", logLabel);
      resolve(result);
    });
  });
};

const teardown = async (done) => {
  try {
    if (server && server.close) {
      await closeServerWithPromise(server);
    }
  } catch (e) {
    logger.error(e, "E2E Bootstrap teardown");
  } finally {
    done();
    process.exit();
  }
};

module.exports = {
  bootstrap: function (done) {
    if (isMainThread) {
      bootstrap();
    }
    done();
  },
  teardown: async function (done) {
    if (isMainThread) {
      await teardown(done);
    } else {
      done();
    }
  },
  bootstrapAll: function (done) {
    bootstrap();
    done();
  },
  teardownAll: async function (done) {
    await teardown(done);
  },
};
