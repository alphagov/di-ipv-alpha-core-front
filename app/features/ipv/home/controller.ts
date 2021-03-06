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
import {
  deleteEvidenceApiRequest,
  getIdentityBundleApiRequest,
  IdentityBundleDto,
  IdentityEvidence,
  SessionData,
} from "../../engine/api";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

import * as hljs from "highlight.js";

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
      label: "(Generic) Activity History",
      href: "/activity-history",
      text: "Add",
    },
  ];

  const fraud = [{ label: "Fraud Check", href: "/fraud-check", text: "Add" }];

  const sessionData: SessionData = req.session.sessionData;
  const debugData: any = hljs.default.highlight(
    `${JSON.stringify(req.session.sessionData, null, 2)}`,
    { language: "json" }
  ).value;

  let activityHistoryScore;
  if (sessionData.activityChecks) {
    const highestActivityHistory = sessionData.activityChecks.reduce(
      (prev, curr) =>
        prev.activityHistoryScore > curr.activityHistoryScore ? prev : curr
    );
    activityHistoryScore = highestActivityHistory.activityHistoryScore;
  }

  let identityVerificationScore;
  if (sessionData.identityVerification) {
    const highestIdentityVerification = sessionData.identityVerification.reduce(
      (prev, curr) =>
        prev.verificationScore > curr.verificationScore ? prev : curr
    );
    identityVerificationScore = highestIdentityVerification.verificationScore;
  }

  let fraudScore;
  if (sessionData.fraudChecks) {
    const highestFraudCheck = sessionData.fraudChecks.reduce((prev, curr) =>
      prev.fraudCheckScore > curr.fraudCheckScore ? prev : curr
    );
    fraudScore = highestFraudCheck.fraudCheckScore;
  }

  return res.render(template, {
    language: req.i18n.language,
    gpg45Profile: sessionData.identityProfile,
    identityEvidence: identityEvidence,
    identityVerification: identityVerification,
    activityHistory: activityHistory,
    fraud: fraud,
    evidenceArray: sessionData.identityEvidence,
    identityVerificationEvidenceArray: sessionData.identityVerification,
    activityHistoryEvidenceArray: sessionData.activityChecks,
    activityHistoryScore: activityHistoryScore,
    identityVerificationScore: identityVerificationScore,
    fraudScore: fraudScore,
    debugData: debugData,
  });
};

const removeEvidence = async (req: Request, res: Response): Promise<void> => {
  const logger = req.app.locals.logger;
  const sessionId: string = req.session.userId;
  const evidenceIdToRemove = req.query["id"].toString();

  try {
    await deleteEvidenceApiRequest(sessionId, evidenceIdToRemove);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to delete evidence, error: ${e}`,
      "backend-api-call"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }

  req.session.sessionData.identityEvidence = req.session.sessionData.identityEvidence.filter(
    (evidence: IdentityEvidence) => evidence.evidenceId != evidenceIdToRemove
  );

  logger.info(
    `Deleted identity evidence ${evidenceIdToRemove}`,
    "deleting-evidence"
  );

  try {
    logger.info(
      `Updating identity bundle for session ${sessionId}`,
      "deleting-evidence"
    );
    const bundle: IdentityBundleDto = await getIdentityBundleApiRequest(
      sessionId
    );
    req.session.sessionData.identityProfile = {
      name: bundle?.identityProfile?.name,
      description: bundle?.identityProfile?.description,
    };
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to fetch identity bundle, error: ${e}`,
      "deleting-evidence"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }

  logger.info(
    `Identity bundle updated for session ${sessionId}`,
    "deleting-evidence"
  );

  res.redirect(pathName.public.HOME);
};

@PageSetup.register
class SetupHomeController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.HOME, getHome);
    router.get(pathName.public.REMOVE_EVIDENCE, removeEvidence);
    return router;
  }
}

export { SetupHomeController, getHome };
