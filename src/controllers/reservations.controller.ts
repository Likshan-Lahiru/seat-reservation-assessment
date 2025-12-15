import type { RequestHandler } from "express";
import { HttpStatus } from "../utils/http";
import * as reservationsService from "../services/reservations.service";

export const createReservation: RequestHandler = async (req, res) => {
    const { body } = (req as any).validated;

    const reservation = await reservationsService.createReservation({
        showId: body.showId,
        seatIds: body.seatIds,
        user: body.user
    });

    res.status(HttpStatus.CREATED).json(reservation);
};

export const listReservations: RequestHandler = async (req, res) => {
    const { query } = (req as any).validated;

    const result = await reservationsService.listReservations({
        showId: query.showId,
        seatId: query.seatId,
        page: query.page,
        limit: query.limit
    });

    res.status(HttpStatus.OK).json(result);
};

export const cancelReservation: RequestHandler = async (req, res) => {
    const { params } = (req as any).validated;
    await reservationsService.cancelReservation(params.id);
    res.status(HttpStatus.NO_CONTENT).send();
};
