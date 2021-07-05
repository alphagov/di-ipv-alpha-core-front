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

import { Request, Response } from "express";
import { getRedisClient } from "../../../session";
import { getRedisCacheByKey } from "../../../utils/redis";
import { createJwtToken } from "./token";

const postOAuthToken = async (req: Request, res: Response): Promise<void> => {
  if (
    req.body.code &&
    req.body.grant_type &&
    req.body.redirect_uri &&
    req.body.client_id
  ) {
    const redisClient = getRedisClient();
    const authCode = req.body.code;

    const userId = await getRedisCacheByKey(
      redisClient,
      "authcode:" + authCode
    );

    const access_token = createJwtToken(userId);
    const refresh_token = createJwtToken(userId);

    redisClient.set("accesstoken:" + access_token, userId);

    const data = {
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires: 60 * 60,
    };

    res.json(data);
  } else {
    res.json({
      error: "invalid_request",
      error_description: "Request was invalid.",
      error_uri:
        "See the full API docs at https://localhost:3010/docs/access_token",
    });
  }
};

// Disabled due to CSURF complications
// @PageSetup.register
// class SetupOAuthTokenController {
//   initialise(): Router {
//     const router = Router();
//     router.get(pathName.public.oauth2.TOKEN, postOAuthToken);
//
//     return router;
//   }
// }

export { postOAuthToken };
