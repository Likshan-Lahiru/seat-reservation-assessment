import { Router } from "express";
import { moviesRoutes } from "./movies.routes";
import { seatsRoutes } from "./seats.routes";
import { reservationsRoutes } from "./reservations.routes";

export const routes = Router();

routes.use("/movies", moviesRoutes);
routes.use("/seats", seatsRoutes);
routes.use("/reservations", reservationsRoutes);
