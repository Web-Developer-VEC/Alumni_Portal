import "express-session";

declare module "express-session" {
  interface SessionData {
    token?: string;

    user?: {
      id?: string;
      displayName?: string;
      email?: string;
      photo?: string;
      role?: string;
    };
  }
}