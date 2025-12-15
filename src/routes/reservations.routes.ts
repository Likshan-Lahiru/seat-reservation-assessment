import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import {
  createReservationSchema,
  listReservationsSchema,
  cancelReservationSchema
} from "../schemas/reservation.schemas";
import * as reservationsController from "../controllers/reservations.controller";

export const reservationsRoutes = Router();

reservationsRoutes.get("/", validate(listReservationsSchema), asyncHandler(reservationsController.listReservations));
reservationsRoutes.post("/", validate(createReservationSchema), asyncHandler(reservationsController.createReservation));
reservationsRoutes.delete("/:id", validate(cancelReservationSchema), asyncHandler(reservationsController.cancelReservation));
