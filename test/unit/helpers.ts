import { Request, Response } from "express";
import Logger from "../../app/utils/logger";
import { sinon } from "../utils/testUtils";

// initialise i18next for tests
require("i18next").init();

export const createReq = (
  logger: Logger,
  sandbox: sinon.SinonSandbox
): Partial<Request> => {
  return {
    body: {},
    cookies: {},
    i18n: {
      language: "en",
    },
    session: {
      engine: {},
      userData: {},
      autoInput: { items: [] },
    },
    t: sandbox.stub(),
    query: {},
    app: {
      get: sandbox.stub(),
      locals: { logger },
      settings: {},
    } as any,
  } as Partial<Request>;
};

export const createRes = (sandbox: sinon.SinonSandbox): Partial<Response> => {
  return {
    cookie: sandbox.stub(),
    render: sandbox.stub(),
    redirect: sandbox.spy(),
    send: sandbox.stub(),
    next: sandbox.stub(),
    locals: {},
  } as Partial<Response>;
};
