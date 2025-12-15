import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { createMovieSchema, listMoviesSchema, listShowsByMovieSchema } from "../schemas/movie.schemas";
import * as moviesController from "../controllers/movies.controller";

export const moviesRoutes = Router();

moviesRoutes.get("/", validate(listMoviesSchema), asyncHandler(moviesController.listMovies));
moviesRoutes.post("/", validate(createMovieSchema), asyncHandler(moviesController.createMovie));

moviesRoutes.get(
    "/:id/shows",
    validate(listShowsByMovieSchema),
    asyncHandler(moviesController.listShowsByMovie)
);
