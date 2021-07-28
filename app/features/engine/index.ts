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

// /ipv
export const startNewSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const logger: Logger = req.app.locals.logger;
  logger.info(
    `[${req.method}] ${req.originalUrl} - creating new session`,
    "backend-api-call"
  );
  const sessionData: SessionData = await startSessionApiRequest(req);

  const sessionId = sessionData.sessionId;
  req.session.sessionData = sessionData;
  req.session.userId = sessionId;
  req.session.autoInput = { items: [] };
  req.session.userData = {};
  req.session.gpg45Profile = null;

  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - getting next route`,
    "backend-api-call"
  );
  const nextRoute: RouteDto = await getNextRouteApiRequest(sessionId);

  res.redirect(Route[nextRoute.route]);
};

export const next = async (
  source: string,
  req: Request,
  res: any
): Promise<void> => {
  const sessionId = req.session.userId;
  let evidenceData = null;
  let evidenceType = EvidenceType.ATP_GENERIC_DATA;

  // We're mocking these below for the time being whilst
  // the services are getting created

  let activityCheckScore = 0;
  let fraudCheckScore = 0;
  let identityVerificationScore = 0;

  const logger: Logger = req.app.locals.logger;
  logger.info(
    `[${req.method}] ${req.originalUrl} (${sessionId}) - Returned back from ATP - source: ${source}`,
    "return-from-atp"
  );

  switch (source) {
    case "information":
      evidenceData = req.session.userData["basicInfo"];
      break;
    case "passport":
      evidenceData = req.session.userData["passport"];
      evidenceType = EvidenceType.UK_PASSPORT;
      break;
    case "bank-account":
      evidenceData = req.session.userData["bankAccount"];
      break;
    case "json":
      evidenceData = req.session.userData["json"];
      activityCheckScore =
        req.session.userData["json"]["scores"]["activityHistory"];
      fraudCheckScore = req.session.userData["json"]["scores"]["identityFraud"];
      identityVerificationScore =
        req.session.userData["json"]["scores"]["verification"];
      break;
    case "driving-licence":
      evidenceData = req.session.userData["drivingLicence"];
      activityCheckScore =
        req.session.userData["drivingLicence"]["scores"]["activityHistory"];
      fraudCheckScore =
        req.session.userData["drivingLicence"]["scores"]["identityFraud"];
      identityVerificationScore =
        req.session.userData["drivingLicence"]["scores"]["verification"];
      break;
    case "mmn":
      evidenceData = req.session.userData["mmn"];
      activityCheckScore =
        req.session.userData["mmn"]["scores"]["activityHistory"];
      fraudCheckScore = req.session.userData["mmn"]["scores"]["identityFraud"];
      identityVerificationScore =
        req.session.userData["mmn"]["scores"]["verification"];
      break;
    case "nino":
      evidenceData = req.session.userData["nino"];
      activityCheckScore =
        req.session.userData["nino"]["scores"]["activityHistory"];
      fraudCheckScore = req.session.userData["nino"]["scores"]["identityFraud"];
      identityVerificationScore =
        req.session.userData["nino"]["scores"]["verification"];
      break;
    default:
      res.status(INTERNAL_SERVER_ERROR);
      res.redirect(pathName.public.ERROR500);
  }

  try {
    const bundleScores: BundleScores = {
      activityCheckScore: activityCheckScore,
      fraudCheckScore: fraudCheckScore,
      identityVerificationScore: identityVerificationScore,
    };
    const newEvidence: EvidenceDto = {
      evidenceId: uuidv4(),
      type: evidenceType,
      evidenceData: evidenceData,
      bundleScores: bundleScores,
    };

    logger.info(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Adding new evidence`,
      "backend-api-call"
    );
    const bundle: SessionData = await addEvidenceApiRequest(
      sessionId,
      newEvidence
    );
    logger.info(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Evidence added`,
      "backend-api-call"
    );
    if (bundle.identityProfile && bundle.identityProfile.description) {
      req.session.gpg45Profile = bundle.identityProfile.description;
    }

    logger.info(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Getting next route`,
      "backend-api-call"
    );
    const nextRoute: RouteDto = await getNextRouteApiRequest(sessionId);
    logger.info(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Next route: ${nextRoute.route}`,
      "backend-api-call"
    );
    res.redirect(Route[nextRoute.route]);
  } catch (e) {
    logger.error(
      `[${req.method}] ${req.originalUrl} (${sessionId}) - Failed to add evidence, error: ${e}`,
      "backend-api-call"
    );
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
  }
};
