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

import winstonLogger from "./winston";

enum SEVERITY {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface ILoggerPayload {
  session_id?: string;
  user_agent?: any;
  declaration?: GADataLayerData;
  error?: any;
}

interface ILogger {
  error: (message: string, label: string, payload?: ILoggerPayload) => void;
  debug: (message: string, label: string, payload?: ILoggerPayload) => void;
  warn: (message: string, label: string, payload?: ILoggerPayload) => void;
  info: (message: string, label: string, payload?: ILoggerPayload) => void;
}

export default class Logger implements ILogger {
  error(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.ERROR, payload);
  }

  debug(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.DEBUG, payload);
  }

  warn(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.WARN, payload);
  }

  info(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.INFO, payload);
  }

  console(
    message: string,
    label: string,
    severity: SEVERITY,
    payload: ILoggerPayload
  ): void {
    switch (severity) {
      case SEVERITY.DEBUG:
        winstonLogger.debug(message, { label, ...payload });
        break;
      case SEVERITY.INFO:
        winstonLogger.info(message, { label, ...payload });
        break;
      case SEVERITY.WARN:
        winstonLogger.warn(message, { label, ...payload });
        break;
      case SEVERITY.ERROR:
        winstonLogger.error(message, { label, ...payload });
        break;
      default:
        break;
    }
  }
}

export const getLogLabel = (path: string): string => {
  const paths: string[] = path.split("\\").pop().split("/");
  return paths[paths.length - 2] + "/" + paths[paths.length - 1];
};
