import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";

export function validate(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return next(
        new AppError({
          status: HttpStatus.UNPROCESSABLE,
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: result.error.flatten()
        })
      );
    }

    (req as any).validated = result.data;
    next();
  };
}
