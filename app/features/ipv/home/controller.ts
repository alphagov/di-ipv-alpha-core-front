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
import { SessionData } from "../../engine/api";

const template = "ipv/home/view.njk";

const getHome = (req: Request, res: Response): void => {
  const identityEvidence = [
    { label: "Basic information", href: "/information", text: "Add" },
    { label: "Passport", href: "/passport", text: "Add" },
    { label: "Drivers Licence", href: "/driving-licence", text: "Add" },
    {
      label: "(Generic) Identity Evidence",
      href: "/identity-evidence",
      text: "Add",
    },
  ];

  const identityVerification = [
    { label: "Selfie Check", href: "/selfie", text: "Enter" },
    {
      label: "(Generic) Identity Verification",
      href: "/identity-verification",
      text: "Add",
    },
  ];

  const activityHistory = [
    { label: "Bank Account", href: "/bank-account", text: "Add" },
    {
      label: "(Generic) Identity History",
      href: "/identity-history",
      text: "Add",
    },
  ];

  const fraud = [{ label: "Fraud Check", href: "/fraud-check", text: "Add" }];

  const sessionData: SessionData = req.session.sessionData;

  return res.render(template, {
    language: req.i18n.language,
    gpg45Profile: sessionData.identityProfile,
    identityEvidence: identityEvidence,
    identityVerification: identityVerification,
    activityHistory: activityHistory,
    fraud: fraud,
    evidenceArray: sessionData.identityEvidence,
  });
};

@PageSetup.register
class SetupHomeController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.HOME, getHome);

    return router;
  }
}

export { SetupHomeController, getHome };
