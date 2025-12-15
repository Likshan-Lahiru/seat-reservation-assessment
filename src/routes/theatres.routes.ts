import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { createTheatreSchema } from "../schemas/theatres.schemas";
import * as theatresController from "../controllers/theatres.controller";

export const theatresRoutes = Router();

theatresRoutes.get("/", asyncHandler(theatresController.listTheatres));
theatresRoutes.post("/", validate(createTheatreSchema), asyncHandler(theatresController.createTheatre));
