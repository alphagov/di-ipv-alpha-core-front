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

const getError400 = (req: Request, res: Response): void => {
  res.render("common/errors/400.njk");
};

const getError404 = (req: Request, res: Response): void => {
  res.render("common/errors/404.njk");
};

const getError500 = (req: Request, res: Response): void => {
  res.render("common/errors/500.njk");
};

const getTimeout = (req: Request, res: Response): void => {
  res.render("common/errors/session-timeout.njk");
};

@PageSetup.register
class SetupErrorsController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.ERROR400, getError400);
    router.get(pathName.public.ERROR404, getError404);
    router.get(pathName.public.ERROR500, getError500);
    router.get(pathName.public.TIMEOUT, getTimeout);

    return router;
  }
}

export {
  SetupErrorsController,
  getError400,
  getError404,
  getError500,
  getTimeout,
};
