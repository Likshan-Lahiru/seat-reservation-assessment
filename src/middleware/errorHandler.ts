import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";

function isPgError(err: any): err is { code: string; detail?: string; constraint?: string } {
  return !!err && typeof err === "object" && typeof err.code === "string";
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }



    if (isPgError(err) && err.code === "23505") {
        return res.status(HttpStatus.CONFLICT).json({
            error: {
                code: "ALREADY_RESERVED",
                message: "These seat(s) are already booked for this show time.",
                details: { constraint: err.constraint, detail: err.detail }
            }
        });
    }



  console.error("Unhandled error:", err);
  return res.status(HttpStatus.INTERNAL).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong." }
  });
};
