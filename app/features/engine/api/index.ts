import axios from "axios";
import { getBackendServiceApiEndpoint } from "./config";

export interface SessionData {
  sessionId: string;
  previousRoute: Route;
  identityVerificationBundle: EvidenceDto;
  identityProfile: any;
}

export enum EvidenceType {
  UK_PASSPORT = "UK_PASSPORT",
  ATP_GENERIC_DATA = "ATP_GENERIC_DATA",
}

export interface EvidenceDto {
  evidenceId: string;
  type: EvidenceType;
  evidenceData: any;
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

const backendApiEndpoint: string = getBackendServiceApiEndpoint();

export const startSessionApiRequest = async (): Promise<SessionData> => {
  const response = await axios.get(`${backendApiEndpoint}/ipv/start-session`);
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
