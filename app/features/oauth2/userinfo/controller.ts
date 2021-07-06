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

import { Request, Response, Router } from "express";
import { PageSetup } from "../../../interfaces/PageSetup";
import { pathName } from "../../../paths";
import { getRedisCacheByKey } from "../../../utils/redis";
import { getTokenFromRequest, isTokenValid } from "../token/token";
import { getRedisClient } from "../../../session";
import Logger from "../../../utils/logger";

const getUserInfo = async (req: Request, res: Response): Promise<void> => {
  const token = getTokenFromRequest(req);

  if (token === null) {
    res.statusCode = 401;
    res.json({
      message: "Token missing or invalid",
    });
    return;
  }

  if (!isTokenValid(token)) {
    res.statusCode = 403;
    res.json({
      message: "Invalid token provided",
    });
    return;
  }
  const userInfo = await fetchUserInfoFromStore(token, req);
  res.json(userInfo);
};

const fetchUserInfoFromStore = async (
  token: any,
  req: Request
): Promise<JSON> => {
  const redisClient = getRedisClient();
  const userId = await getRedisCacheByKey(redisClient, "accesstoken:" + token);

  if (userId === null) {
    const session_id = req.sessionID;
    const logger: Logger = req.app.locals.logger;
    req.session.destroy(() =>
      logger.error("User ID could not be found!", "fetchUserInfoFromStore", {
        session_id,
        user_agent: req.useragent,
      })
    );
  }

  const data = await getRedisCacheByKey(redisClient, "userid:" + userId);
  const json = JSON.parse(data);
  Object.keys(json).forEach((key) => {
    if (json[key]) {
      delete json[key].scores;
    }
  });
  return {
    sub: userId,
    ...json,
  };
};

@PageSetup.register
class SetupUserinfoController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.oauth2.USER_INFO, getUserInfo);

    return router;
  }
}

export { SetupUserinfoController, getUserInfo };
