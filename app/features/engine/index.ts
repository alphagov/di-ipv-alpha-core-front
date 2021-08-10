import { Request, Response } from "express";
import { pathName } from "../../paths";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import {
  addEvidenceApiRequest,
  BundleScores,
  EvidenceDto,
  getNextRouteApiRequest,
  IdentityEvidence,
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

  if (!req.session.identityEvidence) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to find evidence`,
      "no-identity-evidence"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  const evidence: IdentityEvidence =
    req.session.identityEvidence[req.session.identityEvidence.length - 1];

  const bundleScores: BundleScores = {
    ...req.session.bundleScores,
  };

  const newEvidence: EvidenceDto = {
    evidenceId: uuidv4(),
    type: evidence.type,
    evidenceData: { ...evidence.atpResponse, ...evidence.attributes },
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
