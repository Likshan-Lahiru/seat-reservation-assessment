import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { listSeatsSchema, createSeatSchema, listSeatsByShowSchema } from "../schemas/seat.schemas";
import * as seatsController from "../controllers/seats.controller";

export const seatsRoutes = Router();

seatsRoutes.get("/", validate(listSeatsSchema), asyncHandler(seatsController.listSeats));
seatsRoutes.post("/", validate(createSeatSchema), asyncHandler(seatsController.createSeat));
seatsRoutes.get("/by-show/:showId", validate(listSeatsByShowSchema), asyncHandler(seatsController.listSeatsByShow));
