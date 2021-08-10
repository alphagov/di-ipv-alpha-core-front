import axios from "axios";
import { Request } from "express";
import { getBackendServiceApiEndpoint } from "./config";

export interface SessionData {
  sessionId: string;
  previousRoute: Route;
  //identityEvidence: IdentityEvidence;
  //identityVerification: any;
  //activity: any;
  //fraud: any;
  identityVerificationBundle: EvidenceDto;
  identityProfile: any;
}

export enum EvidenceType {
  UK_PASSPORT = "UK_PASSPORT",
  ATP_GENERIC_DATA = "ATP_GENERIC_DATA",
}

export interface BundleScores {
  activityCheckScore: number;
  fraudCheckScore: number;
  identityVerificationScore: number;
}

export interface EvidenceDto {
  evidenceId: string;
  type: EvidenceType;
  evidenceData: any;
  bundleScores?: BundleScores;
}

export interface IdentityEvidence {
  type: EvidenceType;
  strength: number;
  validity: number;
  attributes: any;
  atpResponse?: any;
  jws?: string;
}

export interface RouteDto {
  sessionId: string;
  route: Route;
}

export enum Route {
  HOME = "/ipv/home",
  PASSPORT = "",
  INFORMATION = "",
  ORCHESTRATOR = "",
  ERROR = "",
}

interface AuthParams {
  response_type: any;
  redirect_uri: any;
  state: any;
  client_id: any;
  claims?: any;
}

const backendApiEndpoint: string = getBackendServiceApiEndpoint();

export const startSessionApiRequest = async (
  req: Request
): Promise<SessionData> => {
  const authParams: AuthParams = {
    response_type: req.query.response_type,
    redirect_uri: req.query.redirect_uri,
    state: req.query.state,
    client_id: req.query.client_id,
    claims: req.query.claims,
  };
  const response = await axios.get(
    `${backendApiEndpoint}/ipv/start-session?response_type=${authParams.response_type}&redirect_uri=${authParams.redirect_uri}&state=${authParams.state}&client_id=${authParams.client_id}&claims=${authParams.claims}`
  );
  return response.data;
};

export const returnApiRequest = async (sessionId: string): Promise<any> => {
  const response = await axios.get(
    `${backendApiEndpoint}/ipv/${sessionId}/return`
  );
  return response.data;
};

export const getNextRouteApiRequest = async (
  sessionId: string
): Promise<RouteDto> => {
  const response = await axios.get(
    `${backendApiEndpoint}/ipv/${sessionId}/get-route`
  );
  return response.data;
};

export const addEvidenceApiRequest = async (
  sessionId: string,
  evidence: EvidenceDto
): Promise<SessionData> => {
  const response = await axios.post(
    `${backendApiEndpoint}/ipv/${sessionId}/add-evidence`,
    evidence
  );
  return response.data;
};
