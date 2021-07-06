/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as jwt from "jsonwebtoken";
import * as oidc from "openid-client";
import * as pemJwk from "pem-jwk";

const verifyToken = async (
  issuer: oidc.Issuer<oidc.Client>,
  access_token: string
): Promise<any> => {
  const keystore = await issuer.keystore();
  const jwtDecoded = jwt.decode(access_token, { complete: true });
  const jwk = keystore.get({ kid: jwtDecoded["header"]["kid"] });
  const pem = pemJwk.jwk2pem(jwk as any);
  const result = jwt.verify(`${access_token}`, pem, (err, decoded) => {
    if (err) {
      return { err };
    } else {
      return { decoded };
    }
  });
  return result;
};

const refreshToken = async (
  client: oidc.Client,
  refresh_token: string
): Promise<oidc.TokenSet> => {
  const tokenSet = await client.refresh(refresh_token);
  return tokenSet;
};

export { refreshToken, verifyToken };
