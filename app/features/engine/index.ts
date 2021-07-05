import { Request, Response } from "express";
import { pathName } from "../../paths";
import { getRedisClient } from "../../session";
import { v4 as uuidv4 } from "uuid";
import { RedisClient } from "redis";
import { doCodeCallback } from "../oauth2/authorize";
import { postGPG45ProfileJSON } from "./api";
import { getValidations } from "../ipv";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";

export class Engine {
  start = (req: Request, res: Response): void => {
    req.session.userId = uuidv4();
    req.session.userData = {};
    req.session.validations = null;
    req.session.engine = {};
    req.session.gpg45Profile = null;
    res.redirect(pathName.public.HOME);
    return;
  };

  next = async (source: string, req: Request, res: any): Promise<void> => {
    switch (source) {
      case "information":
      case "passport":
      case "bank-account":
      case "json":
      case "driving-licence":
      case "mmn":
      case "nino": {
        const validations = getValidations(req);
        const data = {
          identityVerificationBundle: {
            identityEvidence: [],
            bundleScores: {
              activityCheckScore: validations?.scores?.activityHistory || 0,
              fraudCheckScore: validations?.scores?.identityFraud || 0,
              identityVerificationScore: validations?.scores?.verification || 0,
            },
          },
        };
        Object.keys(validations).forEach((key) => {
          if (
            validations[key] &&
            validations[key].evidence &&
            validations[key].evidence.strength > 0 &&
            validations[key].evidence.validity > 0
          ) {
            data.identityVerificationBundle.identityEvidence.push({
              evidenceScore: { ...validations[key].evidence },
            });
          }
        });
        try {
          const gpg45Profile = await postGPG45ProfileJSON(data);
          req.session.gpg45Profile =
            gpg45Profile?.matchedIdentityProfile?.description;
          res.redirect(pathName.public.HOME);
        } catch (e) {
          res.status(BAD_REQUEST);
          res.redirect(pathName.public.ERROR400);
        }

        break;
      }
      default:
        res.status(INTERNAL_SERVER_ERROR);
        res.redirect(pathName.public.ERROR500);
    }
  };
  callback = async (req: Express.Request, res: any): Promise<void> => {
    const redisClient = getRedisClient();
    this.doCallback(req, res, redisClient);
  };

  generateUserDataAuthCode = (
    req: Express.Request,
    redisClient: RedisClient
  ): any => {
    const uuid = req.session.userId;
    const data = {
      ...req.session.userData,
      _profile: req.session.gpg45Profile,
    };
    const authCode = uuidv4();

    if (uuid) {
      redisClient.set("userid:" + uuid, JSON.stringify(data));
      redisClient.set("authcode:" + authCode, uuid);
    }

    return authCode;
  };

  doCallback = (
    req: Express.Request,
    res: any,
    redisClient: RedisClient
  ): void => {
    const authCode = this.generateUserDataAuthCode(req, redisClient);
    doCodeCallback(req, res, authCode);
  };
}
