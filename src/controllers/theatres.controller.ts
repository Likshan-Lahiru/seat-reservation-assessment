import type { RequestHandler } from "express";
import { HttpStatus } from "../utils/http";
import * as theatresService from "../services/theatres.service";

export const listTheatres: RequestHandler = async (_req, res) => {
    const theatres = await theatresService.listTheatres();
    res.status(HttpStatus.OK).json(theatres);
};

export const createTheatre: RequestHandler = async (req, res) => {
    const { body } = (req as any).validated;

    const theatre = await theatresService.createTheatre({
        name: body.name,
        imageUrl: body.imageUrl,
        rating: body.rating,
        location: body.location
    });

    res.status(HttpStatus.CREATED).json(theatre);
};
