import { Request, Response } from "express";
import { audience } from "../token/token";
const jose = require("node-jose");

const publicSigningKey = process.env.DI_IPV_SIGN_CERT;
const keystore = jose.JWK.createKeyStore();

const getJwks = async (req: Request, res: Response): Promise<void> => {
  await keystore.add(publicSigningKey, "pem");
  const jwks = keystore.toJSON(false);
  jwks.keys.forEach((key) => {
    key.kid = audience;
    key.use = "sig";
  });

  res.json(jwks);
};

export { getJwks };
