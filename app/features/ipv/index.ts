import { Request } from "express";

export const getScore = (
  req: Request,
  param: string,
  list: Array<string>
): number => {
  let score = 0;
  list.forEach((item) => {
    if (
      req.session.userData[item] &&
      req.session.userData[item].scores &&
      !isNaN(parseInt(req.session.userData[item].scores[param]))
    ) {
      score = Math.min(
        score + parseInt(req.session.userData[item].scores[param]),
        4
      );
    }
  });
  return score;
};

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
    activityHistory: getScore(req, "activityHistory", list),
    identityFraud: getScore(req, "identityFraud", list),
    verification: getScore(req, "verification", list),
  };

  return validations;
};
