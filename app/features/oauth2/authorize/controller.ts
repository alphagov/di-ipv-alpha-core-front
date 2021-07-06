import { PageSetup } from "../../../interfaces/PageSetup";
import { Request, Response, Router } from "express";
import { pathName } from "../../../paths";
import { Engine } from "../../engine";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

const getAuthorize = (req: Request, res: Response): void => {
  if (
    req.query.response_type &&
    req.query.redirect_uri &&
    req.query.state &&
    req.query.client_id
  ) {
    req.session.oauth = {
      response_type: req.query.response_type,
      redirect_uri: req.query.redirect_uri,
      state: req.query.state,
      client_id: req.query.client_id,
    };
    const engine = new Engine();
    engine.start(req, res);
  } else {
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
  }
};

const doCodeCallback = (
  req: Express.Request,
  res: any,
  authorizationCode: string
): void => {
  if (req && req.session && req.session.oauth) {
    res.redirect(
      `${req.session.oauth.redirect_uri}?code=${authorizationCode}&state=${req.session.oauth.state}`
    );
  } else {
    res.status(INTERNAL_SERVER_ERROR);
    res.redirect(pathName.public.ERROR500);
  }
};

@PageSetup.register
class SetupOAuthAuthorizeController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.oauth2.AUTHORIZE, getAuthorize);

    return router;
  }
}

export { SetupOAuthAuthorizeController, getAuthorize, doCodeCallback };
