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

import connectRedis from "connect-redis";
import session from "express-session";
import redis, { ClientOpts } from "redis";

import {
  getRedisPort,
  getRedisSessionSecret,
  getRedisSessionUrl,
  getSessionCookieMaxAge,
  isSessionCookieSecure,
} from "../config";
import express from "express";

const getRedisClientOptions = (): ClientOpts => {
  const redisUrl = getRedisSessionUrl();
  // regex match for rediss from vcap env.
  if (redisUrl.match(/rediss:\/\/\w*:\w+@[\w.-]*:[0-9]+/)) {
    return { url: redisUrl };
  }

  return {
    url: "redis://" + getRedisSessionUrl() + ":" + getRedisPort(),
  };
};

export const getRedisClient = (): redis.RedisClient => {
  const redisOpts = getRedisClientOptions();
  return redis.createClient(redisOpts);
};

export const setupSession = (): express.RequestHandler => {
  if (getRedisSessionSecret() === "" || !getRedisSessionSecret()) {
    throw new Error("Missing session secret in env file");
  }

  const redisClient = getRedisClient();
  const RedisStore = connectRedis(session);

  return session({
    name: "service_session",
    cookie: {
      httpOnly: true,
      maxAge: getSessionCookieMaxAge(),
      secure: isSessionCookieSecure(),
      sameSite: "lax",
    },
    resave: true,
    saveUninitialized: true,
    secret: getRedisSessionSecret(),
    rolling: true,
    store: new RedisStore({ client: redisClient }),
  });
};
