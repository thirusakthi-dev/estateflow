import type { AuthUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      user?: AuthUser;
    }
  }
}
export {};
