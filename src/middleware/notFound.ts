import type { RequestHandler } from "express";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";

export const notFound: RequestHandler = (req, _res, next) => {
  next(
    new AppError({
      status: HttpStatus.NOT_FOUND,
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.path}`
    })
  );
};
