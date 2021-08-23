import { Request, Response } from "express";
import { pathName } from "../../paths";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import {
  addEvidenceApiRequest,
  IdentityBundleDto,
  BundleScores,
  EvidenceDto,
  getNextRouteApiRequest,
  IdentityEvidence,
  Route,
  RouteDto,
  startSessionApiRequest,
  StartSessionDTO,
  getIdentityBundleApiRequest,
} from "./api";
import Logger from "../../utils/logger";

const logger: Logger = new Logger();

const getNextRouteAndRedirect = async (req: Request, res: Response) => {
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
  logger.info(
    `[${req.method}] ${req.originalUrl} - creating new session`,
    "backend-api-call"
  );
  let createdSession: StartSessionDTO;
  let sessionId: string;
  try {
    createdSession = await startSessionApiRequest(req);
    sessionId = createdSession.sessionId;
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

  req.session.userId = sessionId;

  req.session.sessionData = {
    sessionId: createdSession.sessionId,
  };

  req.session.autoInput = { items: [] };

  await getNextRouteAndRedirect(req, res);
};

export const next = async (
  source: string,
  req: Request,
  res: any
): Promise<void> => {
  const sessionId = req.session.userId;
  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Returned back from ATP - source: ${source}`,
    "return-from-atp"
  );
  switch (source) {
    case "identity-evidence":
      await addEvidence(req, res);
      break;
    case "identity-verification":
      // TODO: Create an API endpoint to add identity verification and recalculate
      break;
    case "activity-history":
      // TODO: Create an API endpoint to add activity history and recalculate
      break;
    case "fraud-check":
      // TODO: Create an API endpoint to add fraud check and recalculate
      break;
  }

  await getNextRouteAndRedirect(req, res);
};

const addEvidence = async (req: Request, res: Response): Promise<void> => {
  const sessionId: string = req.session.userId;
  if (!req.session.sessionData.identityEvidence) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to find evidence`,
      "no-identity-evidence"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  const evidence: IdentityEvidence = req.session.sessionData.identityEvidence.pop();

  const bundleScores: BundleScores = {
    ...req.session.bundleScores,
  };

  const newEvidence: EvidenceDto = {
    evidenceId: uuidv4(),
    type: evidence.type,
    evidenceData: { ...evidence.atpResponse, ...evidence.attributes },
    bundleScores: bundleScores,
    evidenceScore: {
      strength: evidence.strength,
      validity: evidence.validity,
    },
  };

  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Adding new evidence`,
    "backend-api-call"
  );

  let bundle: IdentityBundleDto;
  try {
    const addedEvidence = await addEvidenceApiRequest(sessionId, newEvidence);
    // This will update the actual evidence with the added evidence which contains the generated UUID.
    req.session.sessionData.identityEvidence.push(addedEvidence);

    bundle = await getIdentityBundleApiRequest(sessionId);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to add evidence, error: ${e}`,
      "backend-api-call"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  req.session.sessionData.identityProfile = {
    name: bundle?.identityProfile?.name,
    description: bundle?.identityProfile?.description,
  };
};
