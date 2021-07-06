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

import express, { NextFunction, Request, Response } from "express";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nextMiddleware from "i18next-http-middleware";
import * as nunjucks from "nunjucks";
import path from "path";
const httpOnlyCookie = require("./i18next/language-detector-httpOnly-cookie");
const punycode = require("punycode");

import Logger from "./utils/logger";

function parseQuery(queryString = ""): any {
  const query = {};
  const pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString
  ).split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

const configureLogger = (app: express.Application): void => {
  app.locals.logger = new Logger();
};

const configureNunjucks = (app: express.Application): void => {
  const nunjucksEnv: nunjucks.Environment = nunjucks.configure(
    ["app/features", path.resolve("node_modules/govuk-frontend/")],
    {
      autoescape: true,
      express: app,
      noCache: true,
    }
  );

  nunjucksEnv.addFilter("updateUrlQuery", function (url = "", query?: any) {
    if (!query) {
      return url;
    }
    const urlSplit = url.split(/[?]/);
    const urlQuery = urlSplit.length < 2 ? {} : parseQuery(urlSplit[1]);
    const merged = { ...urlQuery, ...query };

    const queryArray = [];
    for (const [key, value] of Object.entries(merged)) {
      queryArray.push(
        encodeURIComponent(key) +
          (value ? "=" + encodeURIComponent(value.toString()) : "")
      );
    }

    return urlSplit[0] + "?" + queryArray.join("&");
  });

  nunjucksEnv.addFilter("toUnicode", function (text: string) {
    try {
      return punycode.toUnicode(text);
    } catch {
      return text;
    }
  });

  nunjucksEnv.addFilter("toJSON", function (obj: any, spacing = null) {
    try {
      return JSON.stringify(obj, null, spacing);
    } catch {
      return "?";
    }
  });

  nunjucksEnv.addFilter(
    "lastErrors",
    function (errors: Array<any>, groups = []) {
      if (!errors) return errors;
      errors = errors.reverse();
      try {
        errors.forEach((e) => {
          groups.forEach((g) => {
            if (e.href.startsWith(g)) e.grp = g;
          });
          if (!e.grp) {
            e.grp = e.href;
          }
        });
        let lg = "";
        const output = [];
        errors.forEach((e) => {
          if (e.grp != lg) {
            output.push(e);
            lg = e.grp;
          }
        });
        return output.reverse();
      } catch {
        return [];
      }
    }
  );

  nunjucksEnv.addFilter("encodeURIComponent", function (text: string) {
    return encodeURIComponent(text);
  });

  nunjucksEnv.addFilter("decodeURIComponent", function (text: string) {
    return decodeURIComponent(text);
  });

  nunjucksEnv.addFilter("translate", function (key: string, options?: any) {
    const translate = i18next.getFixedT(this.ctx.i18n.language);
    return translate(key, options);
  });

  nunjucksEnv.addFilter("eval", function (text: string) {
    return nunjucks.renderString(text, this.ctx);
  });

  app.set("engine", nunjucksEnv);
};

const missingKeyMessage = (key: string): void => {
  Logger.prototype.error(
    `Missing Key [${key}] in translation file`,
    "Missing Translation Key"
  );
};

const configureInternalization = (app: express.Application): void => {
  const fallbackLng = "en";
  const logger: Logger = app.locals.logger;
  const lngDetector = new i18nextMiddleware.LanguageDetector();
  lngDetector.addDetector(httpOnlyCookie);
  i18next
    .use(Backend)
    .use(lngDetector)
    .init({
      backend: {
        loadPath: "./locale/{{lng}}/{{ns}}.json",
      },
      detection: {
        lookupCookie: "language",
        order: ["querystring", "httpOnlyCookie"],
        caches: ["httpOnlyCookie"],
      },
      fallbackLng,
      preload: ["en"],
      saveMissing: true,

      missingKeyHandler: (ng, ns, key) => missingKeyMessage(key),
    })
    .then(() => {
      logger.info("i18n loaded successfully.", "i18n");
    })
    .catch((error: any) => {
      logger.error(`i18n failed to load: ${error.stack.message}`, "i18n");
    });

  app.use(
    i18nextMiddleware.handle(i18next, {
      removeLngFromUrl: true,
      setHeader: (res, name, value) => {
        const globalRegex = new RegExp(
          "^(([a-z]{2})-?([a-z]{2})?)s*;?s*(q=([0-9.]+))?",
          "gi"
        );
        res.setHeader(name, globalRegex.test(value) ? value : fallbackLng);
      },
    })
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.i18n) {
      res.locals.htmlLang = req.i18n.language; // used to set <html lang="{{ htmlLang | default('en') }}" ... in govuk frontend template
    }
    next();
  });
};

export {
  configureInternalization,
  configureLogger,
  configureNunjucks,
  missingKeyMessage,
};
