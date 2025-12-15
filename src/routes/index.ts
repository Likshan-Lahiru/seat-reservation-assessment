import { Router } from "express";
import { moviesRoutes } from "./movies.routes";
import { seatsRoutes } from "./seats.routes";
import { reservationsRoutes } from "./reservations.routes";
import {theatresRoutes} from "./theatres.routes";

export const routes = Router();

routes.use("/movies", moviesRoutes);
routes.use("/seats", seatsRoutes);
routes.use("/reservations", reservationsRoutes);
routes.use("/theatres", theatresRoutes);
