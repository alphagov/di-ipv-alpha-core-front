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

/**
 * Sample file output
 * 
 * {
 *     "timestamp": "2020-07-20T15:45:16.374Z",
 *     "tag": "",
 *     "process_name": "", 
 *     "process_id": "", 
 *     "log-path": "",
 *     "severity": "informational",
 *     "body": [{
 *         "subject": "",
 *         "key1": "value1",
 *         "key2": "value2"
 *     }]
 * }

*/

import { transports, format, createLogger } from "winston";
import * as config from "../../config";
import { getLogLevel } from "../../config";
import path from "path";

const logFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.printf((info) => {
    const formattedInfo = {
      timestamp: info.timestamp,
      tag: info.service,
      process_name: path.parse(process.argv[1]).base,
      process_id: process.pid,
      "log-path": info["log-path"],
      severity: info.level,
      body: {
        subject: info.stack ? info.name : info.message,
        stack: info.stack,
        label: info.label,
        session_id: info.session_id,
        user_agent: info.user_agent
          ? {
              browser: info.user_agent.browser,
              version: info.user_agent.version,
              os: info.user_agent.os,
              platform: info.user_agent.platform,
              source: info.user_agent.source,
              isDesktop: info.user_agent.isDesktop,
              isMobile: info.user_agent.isMobile,
              isTablet: info.user_agent.isTablet,
              isCurl: info.user_agent.isCurl,
              isBot: info.user_agent.isBot,
            }
          : undefined,
        declaration: info.declaration,
      },
    };
    return JSON.stringify(formattedInfo);
  })
);

let consoleLogFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp(),
  format.printf((info) => {
    const label = info.label ? ` [${info.label}]` : "";
    const session_id = info.session_id ? `[${info.session_id}]` : "";
    const formattedDate = info.timestamp.replace("T", " ").replace("Z", "");
    return `${formattedDate} ${info.level}:${label} ${info.message} ${session_id}`;
  })
);

if (config.enableAnsiLog()) {
  consoleLogFormat = format.combine(
    consoleLogFormat,
    format.colorize({ all: true })
  );
}

const logPath = process.cwd() + config.getLogFilePath();

const devTransports = [
  new transports.File({
    filename: logPath,
    maxsize: 5242880,
    format: logFormat,
  }),
  new transports.Console({
    format: consoleLogFormat,
  }),
];

const otherTransports = [
  new transports.Console({
    format: logFormat,
  }),
];

const winstonLogger = createLogger({
  defaultMeta: { service: "di-ipv-core-front", "log-path": logPath },
  level: getLogLevel(),
  transports:
    process.env.NODE_ENV == "development" ? devTransports : otherTransports,
});

export default winstonLogger;
