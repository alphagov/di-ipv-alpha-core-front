import { Request, Response } from "express";
import { pathName } from "../../paths";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import {
  addEvidenceApiRequest,
  BundleScores,
  EvidenceDto,
  EvidenceType,
  getNextRouteApiRequest,
  Route,
  RouteDto,
  SessionData,
  startSessionApiRequest,
} from "./api";
import Logger from "../../utils/logger";

const getNextRouteAndRedirect = async (req: Request, res: Response) => {
  const logger: Logger = req.app.locals.logger;
  const sessionId: string = req.session.userId;

  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Getting next route`,
    "backend-api-call"
  );

  try {
    const nextRoute: RouteDto = await getNextRouteApiRequest(sessionId);
    logger.info(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Next route: ${nextRoute.route}`,
      "backend-api-call"
    );
    res.redirect(Route[nextRoute.route]);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to get the next route, error: ${e}`,
      "backend-api-call"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }
};

export const startNewSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const logger: Logger = req.app.locals.logger;
  logger.info(
    `[${req.method}] ${req.originalUrl} - creating new session`,
    "backend-api-call"
  );
  let sessionData: SessionData;
  let sessionId: string;
  try {
    sessionData = await startSessionApiRequest(req);
    sessionId = sessionData.sessionId;
    logger.info(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Created a new session`,
      "backend-api-call"
    );
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to create a new session, error: ${e}`,
      "backend-api-call"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }

  req.session.sessionData = sessionData;
  req.session.userId = sessionId;
  req.session.autoInput = { items: [] };
  req.session.userData = {};
  req.session.gpg45Profile = null;

  await getNextRouteAndRedirect(req, res);
};

export const next = async (
  source: string,
  req: Request,
  res: any
): Promise<void> => {
  const sessionId = req.session.userId;

  const logger: Logger = req.app.locals.logger;
  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Returned back from ATP - source: ${source}`,
    "return-from-atp"
  );

  const extractedData = extractDataFromEvidence(source, req, res);

  const bundleScores: BundleScores = {
    ...req.session.bundleScores,
  };

  const newEvidence: EvidenceDto = {
    evidenceId: uuidv4(),
    type: extractedData.evidenceType,
    evidenceData: extractedData.evidenceData,
    bundleScores: bundleScores,
  };

  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Adding new evidence`,
    "backend-api-call"
  );

  let bundle: SessionData;
  try {
    bundle = await addEvidenceApiRequest(sessionId, newEvidence);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to add evidence, error: ${e}`,
      "backend-api-call"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  if (bundle && bundle.identityProfile && bundle.identityProfile.description) {
    req.session.gpg45Profile = bundle.identityProfile.description;
  }

  await getNextRouteAndRedirect(req, res);
};

// TODO (PYI-19): Refactor this once the ATPs know what type they are.
//       This will all get removed from the frontend after we finish mocking the bundle scores (activity, fraud, verification)
//       PYI-87 ticket should cover some of this work.

const sourceDataMap = {
  information: "basicInfo",
  passport: "passport",
  "bank-account": "bankAccount",
  "driving-license": "drivingLicense",
  mmn: "mmn",
  nino: "nino",
};

const extractDataFromEvidence = (
  source: string,
  req: Request,
  res: Response
) => {
  const dataKey = sourceDataMap[source];
  const logger: Logger = req.app.locals.logger;

  if (dataKey == null) {
    logger.info(
      `[${req.method}] ${req.originalUrl} (${req.session.userId}) - Source not mapped to anything - source: ${source}`,
      "return-from-atp"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }

  // We're mocking these values for the time being.
  if (dataKey === "drivingLicense" || dataKey === "mmn" || dataKey === "nino") {
    req.session.bundleScores = {
      activityCheckScore:
        req.session.userData[dataKey]["scores"]["activityHistory"] || 0,
      fraudCheckScore:
        req.session.userData[dataKey]["scores"]["identityFraud"] || 0,
      identityVerificationScore:
        req.session.userData[dataKey]["scores"]["verification"] || 0,
    };
  }

  return {
    evidenceData: req.session.userData[dataKey],
    // Currently setting this here, but will be removed as part of PYI-87 ticket.
    evidenceType:
      dataKey === "passport"
        ? EvidenceType.UK_PASSPORT
        : EvidenceType.ATP_GENERIC_DATA,
  };
};
