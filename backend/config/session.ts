import "express-session";

declare module "express-session" {
  interface SessionData {
    token?: string;

    user?: {
      id?: string | undefined;
      displayName?: string | undefined;
      email?: string | undefined;
      photo?: string | undefined;
      role?: string | undefined;
    };
  }
}