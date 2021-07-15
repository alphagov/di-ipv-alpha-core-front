import { Request, Response } from "express";
import { pathName } from "../../paths";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import {
  addEvidenceApiRequest,
  EvidenceDto,
  EvidenceType,
  getNextRouteApiRequest,
  Route,
  RouteDto,
  SessionData,
  startSessionApiRequest,
} from "./api";

export const startNewSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionData: SessionData = await startSessionApiRequest();

  const sessionId = sessionData.sessionId;
  req.session.sessionData = sessionData;
  req.session.userId = sessionId;
  req.session.userData = {};
  req.session.gpg45Profile = null;

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
      break;
    case "driving-licence":
      evidenceData = req.session.userData["drivingLicence"];
      break;
    case "mmn":
      evidenceData = req.session.userData["mmn"];
      break;
    case "nino":
      evidenceData = req.session.userData["nino"];
      break;
    default:
      res.status(INTERNAL_SERVER_ERROR);
      res.redirect(pathName.public.ERROR500);
  }

  try {
    const newEvidence: EvidenceDto = {
      evidenceId: uuidv4(),
      type: evidenceType,
      evidenceData: evidenceData,
    };

    const bundle: SessionData = await addEvidenceApiRequest(
      sessionId,
      newEvidence
    );
    if (bundle.identityProfile && bundle.identityProfile.description) {
      req.session.gpg45Profile = bundle.identityProfile.description;
    }

    const nextRoute: RouteDto = await getNextRouteApiRequest(sessionId);
    res.redirect(Route[nextRoute.route]);
  } catch (e) {
    res.status(BAD_REQUEST);
    res.redirect(pathName.public.ERROR400);
  }
};
