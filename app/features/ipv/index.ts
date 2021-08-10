import { Request } from "express";

export const getValidations = (req: Request): any => {
  const list = [
    "bankAccount",
    "drivingLicence",
    "passport",
    "basicInfo",
    "mmn",
    "nino",
  ];
  const validations = {};

  list.forEach((item) => {
    validations[item] = req.session.userData[item]
      ? {
          validation: req.session.userData[item].validation,
          evidence: req.session.userData[item].evidence || {
            strength: 0,
            validity: 0,
          },
        }
      : null;
  });

  if (req.session.bundleScores) {
    validations["scores"] = {
      activityHistory: req.session.bundleScores.activityCheckScore || 0,
      identityFraud: req.session.bundleScores.fraudCheckScore || 0,
      verification: req.session.bundleScores.identityVerificationScore || 0,
    };
  } else {
    validations["scores"] = {
      activityHistory: 0,
      identityFraud: 0,
      verification: 0,
    };
  }

  return validations;
};
