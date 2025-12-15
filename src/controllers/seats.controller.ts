import type { RequestHandler } from "express";
import { HttpStatus } from "../utils/http";
import * as seatsService from "../services/seats.service";

export const listSeats: RequestHandler = async (req, res) => {
    const { query } = (req as any).validated;

    const seats = await seatsService.listSeats(query.theatreId);
    res.status(HttpStatus.OK).json(seats);
};

export const createSeat: RequestHandler = async (req, res) => {
    const { body } = (req as any).validated;

    const seat = await seatsService.createSeat({
        theatreId: body.theatreId,
        label: body.label
    });

    res.status(HttpStatus.CREATED).json(seat);
};
