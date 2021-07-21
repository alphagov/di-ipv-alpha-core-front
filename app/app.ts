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

require("dotenv").config();
import cookieParser from "cookie-parser";
import csurf from "csurf";
import express from "express";
import webpack from "webpack";
import webpackDevMiddleware, { Options } from "webpack-dev-middleware";

import { shouldLogSession } from "../config";
import webpackDevConfig from "../webpack/webpack.dev.js";

import {
  configureInternalization,
  configureLogger,
  configureNunjucks,
} from "./app-config";
import { setupCsrfToken } from "./middleware/csrf-middleware";
import {
  pageNotFoundHandler,
  serverErrorHandler,
} from "./handlers/error-handlers";
import {
  logErrorMiddleware,
  logRequestMiddleware,
} from "./middleware/logger-middleware";
import { router } from "./routes";
import { setupSession } from "./session";
import {
  logSession,
  sessionTimeOutDialogStartCheck,
} from "./middleware/session-middleware";
import { filterRequest } from "./middleware/xss-middleware";
import helmet from "helmet";
import nocache from "nocache";
import { fetchCookie } from "./middleware/cookie-middleware";
import { existsSync } from "fs";
import { setLocalVars } from "./middleware/set-locals";
import useragent from "express-useragent";
import { pathName } from "./paths";

const crypto = require("crypto");
const fs = require("fs");

const fileHash = (filename: string): string => {
  if (existsSync(filename)) {
    const file_buffer = fs.readFileSync(filename);
    const sum = crypto.createHash("md5");
    sum.update(file_buffer);
    const hex = sum.digest("hex");
    return hex;
  } else {
    return "dev";
  }
};

const createApp = (): express.Application => {
  const app: express.Application = express();
  const node_env: string = process.env.NODE_ENV;
  app.locals.environment = process.env.ENVIRONMENT;
  app.locals.knownPaths = [];
  const publicKeys = Object.keys(pathName.public);
  publicKeys.forEach((key) => {
    const pth = pathName.public[key];
    app.locals.knownPaths.push(pth);
  });

  app.locals.allJsSuffix = "ref=" + fileHash("./build/all.js");
  app.locals.styleCssSuffix = "ref=" + fileHash("./build/style.css");
  app.use(useragent.express());
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        frameSrc: ["https://www.googletagmanager.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
        ],
        scriptSrc: [
          "'self'",
          "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
          "'sha256-9XY5Gy2dQzMz7vEBVmHq5oL6lwMY5OD8GXGFHG1FIt0='",
          "'sha256-8EAj23is6S15MqKEZyEUwkySwX+ECmNHCS48+5c9ycY='",
          "'sha256-gGKtWVlwtb9dj1Sa7K4ybKpqUOE61nkachaCJ1LfmFY='",
          "'sha256-mucrrw5J6PKI6zn3xs64Q7aaThRouvSD1FKsWFg24Wk='",
          "'sha256-sNEhyAswTBSPnegdEB1z/BKKUaCXs0HeKkW28zu+7Uw='",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://ssl.google-analytics.com",
        ],
        objectSrc: ["'none'"],
        connectSrc: ["'self'", "https://www.google-analytics.com"],
      },
    })
  );
  app.use(helmet.frameguard({ action: "deny" }));
  configureLogger(app);
  configureInternalization(app);
  configureNunjucks(app);
  app.use(cookieParser());

  app.use(setupSession());
  if (node_env !== "test") {
    app.use(logRequestMiddleware);
  }
  app.use(fetchCookie);
  app.use(logErrorMiddleware);
  app.use(express.static("build", { maxAge: 31557600000 }));
  app.use(nocache());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(csurf());
  app.use(setupCsrfToken);
  app.post("*", filterRequest);
  if (node_env === "development") {
    const [serverDevConfig, clientDevConfig] = webpackDevConfig;
    const compiler = webpack([serverDevConfig, clientDevConfig]);
    const options = { stats: "errors-only" } as Options;
    const wpDevMiddleware = webpackDevMiddleware(compiler, options);
    app.use(wpDevMiddleware);
  }

  if (shouldLogSession()) {
    app.use(logSession);
  }
  app.use(sessionTimeOutDialogStartCheck);
  app.use(setLocalVars);
  app.use(router);
  app.use(serverErrorHandler);
  app.use(pageNotFoundHandler);

  return app;
};

export { createApp };
