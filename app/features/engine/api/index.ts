import axios from "axios";
import { Request } from "express";
import { getBackendServiceApiEndpoint } from "./config";

export interface StartSessionDTO {
  sessionId: string;
  previousRoute: Route;
}

export interface IdentityBundleDto {
  sessionId: string;
  previousRoute: Route;
  identityVerificationBundle: IdentityVerificationBundle;
  identityProfile: IdentityProfile;
}

export interface SessionData {
  sessionId: string;
  identityEvidence: [IdentityEvidence];
  identityVerification: [IdentityVerification];
  activityChecks: [Activity];
  fraudChecks: [Fraud];
  identityProfile: IdentityProfile;
}

export interface IdentityVerificationBundle {
  identityEvidence: [any];
  activityChecks: [Activity];
  fraudCheck: [Fraud];
  identityVerification: [IdentityVerification];
  bundleScores: BundleScores;
}

export interface IdentityProfile {
  name: string;
  description: string;
  // confidence: ConfidenceLevel,
  // evidenceScores: [EvidenceScore],
  // activityHistory: Enumerator.SCORE
  // identityFraud: Enumerator.SCORE
  // verification: Enumerator.SCORE
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

export interface EvidenceScore {
  strength: number;
  validity: number;
}

export interface EvidenceDto {
  evidenceId: string;
  type: EvidenceType;
  evidenceData: any;
  bundleScores?: BundleScores;
  evidenceScore?: EvidenceScore;
}

export interface IdentityEvidence {
  evidenceId?: string;
  type: EvidenceType;
  strength: number;
  validity: number;
  attributes: any;
  atpResponse?: any;
  jws?: string;
}

export interface IdentityVerification {
  type: any;
  verificationData: any;
}

export interface Activity {
  type: any;
  activityHistory: any;
}

export interface Fraud {
  fraudData: any;
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
): Promise<StartSessionDTO> => {
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
): Promise<EvidenceDto> => {
  const response = await axios.post(
    `${backendApiEndpoint}/ipv/${sessionId}/add-evidence`,
    evidence
  );
  return response.data;
};

export const deleteEvidenceApiRequest = async (
  sessionId: string,
  evidenceId: string
): Promise<void> => {
  const response = await axios.get(
    `${backendApiEndpoint}/ipv/${sessionId}/evidence/${evidenceId}/delete`
  );
  return response.data;
};

export const getIdentityBundleApiRequest = async (
  sessionId: string
): Promise<IdentityBundleDto> => {
  const response = await axios.get(
    `${backendApiEndpoint}/ipv/${sessionId}/session`
  );
  return response.data;
};
