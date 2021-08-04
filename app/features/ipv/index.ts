import { Request } from "express";

export const getValidations = (req: Request): any => {
  const list = [
    "bankAccount",
    "drivingLicence",
    "passport",
    "basicInfo",
    "json",
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

  validations["scores"] = {
    activityHistory: req.session.bundleScores.activityCheckScore,
    identityFraud: req.session.bundleScores.fraudCheckScore,
    verification: req.session.bundleScores.identityVerificationScore,
  };

  return validations;
};
