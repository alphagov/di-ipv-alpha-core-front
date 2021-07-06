declare namespace Express {
  interface Application {
    oauth: any;
  }
  interface Request {
    useragent?: any;
    i18n?: {
      language?: string;
    };
    t: TFunction;
    csrfToken?: () => string;
  }

  interface SessionData {
    engine: any;
    basicInfo: any;
    passport: any;
  }
}
