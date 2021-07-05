import { Request, Response } from "express";
import * as fs from "fs";
import { audience } from "../token/token";
const pem2jwk = require("pem-jwk").pem2jwk;

const publicSigningKey = fs.readFileSync(
  "./keys/public-di-ipv-atp-playbox.pem"
);

const getJwks = (req: Request, res: Response): void => {
  const jwk = pem2jwk(publicSigningKey);
  res.json({
    keys: [
      {
        ...jwk,
        kid: audience,
        use: "sig",
      },
    ],
  });
};

export { getJwks };
