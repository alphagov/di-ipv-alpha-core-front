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
  addIdentityVerificationApiRequest,
  IdentityVerification,
  addActivityHistoryApiRequest,
  ActivityHistory,
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
    case "information":
    case "passport":
    case "driving-licence":
      await addEvidence(req, res);
      break;
    case "identity-verification":
      logger.info(
        `[${req.method}] ${req.originalUrl} (${sessionId}) - Adding identity verification to core-back`,
        "adding-to-core-back"
      );
      await addIdentityVerification(req, res);
      break;
    case "activity-history":
      await addActivityHistory(req, res);
      break;
    case "fraud-check":
      // TODO: Create an API endpoint to add fraud check and recalculate
      break;
  }

  await getNextRouteAndRedirect(req, res);
};

const addActivityHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionId: string = req.session.userId;
  if (!req.session.sessionData.activityHistory) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to find activity history`,
      "no-activity-history"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  const activityHistory: ActivityHistory = req.session.sessionData.activityHistory.pop();

  try {
    const activityHistoryResponse = await addActivityHistoryApiRequest(
      sessionId,
      activityHistory
    );

    req.session.sessionData.activityHistory.push(activityHistoryResponse);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to add activity history, ${e}`,
      "failed-to-add-activity history"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }

  await fetchIdentityBundleAndUpdateProfile(req, res);
};

const addIdentityVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionId: string = req.session.userId;
  if (!req.session.sessionData.identityVerification) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to find identity verification`,
      "no-identity-verification"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  const identityVerification: IdentityVerification = req.session.sessionData.identityVerification.pop();

  try {
    const identityVerificationResponse = await addIdentityVerificationApiRequest(
      sessionId,
      identityVerification
    );

    // note(martin): Commented this out as we may be able to remove this bundle scores from core-front completely
    // update the bundle scores that get packages with the evidence calls
    // req.session.bundleScores = req.session.bundleScores || {
    //   activityCheckScore: 0,
    //   fraudCheckScore: 0,
    //   identityVerificationScore: 0,
    // };
    // req.session.bundleScores.identityVerificationScore =
    //   identityVerificationResponse.verificationScore;

    req.session.sessionData.identityVerification.push(
      identityVerificationResponse
    );
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to add identity verification, ${e}`,
      "failed-to-add-identity-verification"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }

  await fetchIdentityBundleAndUpdateProfile(req, res);
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
  };

  if (evidence.strength || evidence.validity) {
    newEvidence.evidenceScore = {
      strength: evidence.strength || 0,
      validity: evidence.validity || 0,
    };
  }

  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Adding new evidence`,
    "backend-api-call"
  );

  try {
    const addedEvidence = await addEvidenceApiRequest(sessionId, newEvidence);
    // This will update the actual evidence with the added evidence which contains the generated UUID.
    req.session.sessionData.identityEvidence.push(addedEvidence);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to add evidence, error: ${e}`,
      "backend-api-call"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
    return;
  }

  await fetchIdentityBundleAndUpdateProfile(req, res);
};

const fetchIdentityBundleAndUpdateProfile = async (
  req: Request,
  res: Response
): Promise<IdentityBundleDto> => {
  const sessionId = req.session.sessionData.sessionId;
  try {
    const bundle = await getIdentityBundleApiRequest(sessionId);

    req.session.sessionData.identityProfile = {
      name: bundle?.identityProfile?.name,
      description: bundle?.identityProfile?.description,
    };

    return bundle;
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to fetch identity bundle, error: ${e}`,
      "backend-api-call"
    );
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
    return;
  }
};
