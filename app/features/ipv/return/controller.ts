import { PageSetup } from "../../../interfaces/PageSetup";
import { Request, Response, Router } from "express";
import { pathName } from "../../../paths";
import { returnApiRequest } from "../../engine/api";

interface AuthResponse {
  redirectionURI: string;
  state: {
    value: string;
  };
  authorizationCode: {
    value: string;
  };
}

const returnToOrchestrator = async (
  req: Request,
  res: Response
): Promise<void> => {
  // call backend /return
  const sessionId = req.session.userId;
  const authResponse: AuthResponse = await returnApiRequest(sessionId);

  res.redirect(
    `${authResponse.redirectionURI}?state=${authResponse.state.value}&code=${authResponse.authorizationCode.value}`
  );
};

@PageSetup.register
class SetupReturnController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.RETURN, returnToOrchestrator);

    return router;
  }
}

export { SetupReturnController, returnToOrchestrator };
