/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { createTerminus } from "@godaddy/terminus";
import http from "http";

import { createApp } from "./app";
import { onHealthCheck } from "./health-check";
import Logger, { getLogLabel } from "./utils/logger";

const app = createApp();

const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

const server = http.createServer(app);

createTerminus(server, {
  healthChecks: { "/health": onHealthCheck, verbatim: true },
  timeout: 1000,
});

server.keepAliveTimeout = 1000 * (60 * 6); // 6 minutes

server
  .listen(port, () => {
    logger.info(`Server listening on port ${port}`, logLabel);
  })
  .on("error", (error: Error) => {
    logger.error(
      `Unable to start server because of ${error.message}`,
      logLabel
    );
  });
