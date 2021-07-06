import { NextFunction, Router, Request, Response } from "express";
import { PageSetup } from "../../../interfaces/PageSetup";

function redirectAppIconFn(to: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.redirect(301, to);
    } catch (e) {
      return next(e);
    }
  };
}

@PageSetup.register
class SetupAppIconController {
  initialise(): Router {
    const router = Router();
    router.get("/favicon.ico", redirectAppIconFn("/assets/images/favicon.ico"));
    router.get(
      "/apple-touch-icon-180x180.png",
      redirectAppIconFn("/assets/images/govuk-apple-touch-icon-180x180.png")
    );
    router.get(
      "/apple-touch-icon-167x167.png",
      redirectAppIconFn("/assets/images/govuk-apple-touch-icon-167x167.png")
    );
    router.get(
      "/apple-touch-icon-152x152.png",
      redirectAppIconFn("/assets/images/govuk-apple-touch-icon-152x152.png")
    );
    router.get(
      "/apple-touch-icon.png",
      redirectAppIconFn("/assets/images/govuk-apple-touch-icon.png")
    );
    return router;
  }
}

export { SetupAppIconController };
