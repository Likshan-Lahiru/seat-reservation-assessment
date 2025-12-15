import type { HttpStatusCode } from "./http";

export class AppError extends Error {
  public readonly status: HttpStatusCode;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(opts: { status: HttpStatusCode; code: string; message: string; details?: unknown }) {
    super(opts.message);
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
  }
}
