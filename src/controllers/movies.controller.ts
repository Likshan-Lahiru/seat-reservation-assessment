import type { RequestHandler } from "express";
import { HttpStatus } from "../utils/http";
import * as moviesService from "../services/movies.service";

export const createMovie: RequestHandler = async (req, res) => {
    const { body } = (req as any).validated;

    const result = await moviesService.createMovieWithShows({
        title: body.title,
        imageUrl: body.imageUrl,
        theatreId: body.theatreId,
        startDate: body.startDate,
        endDate: body.endDate,
        showTimes: body.showTimes,
        durationMinutes: body.durationMinutes,
        timezone: body.timezone
    });

    res.status(HttpStatus.CREATED).json(result);
};

export const listMovies: RequestHandler = async (_req, res) => {
    console.log("coming to list movies controller");
    const movies = await moviesService.listMovies();
    res.status(HttpStatus.OK).json(movies);
};

export const listShowsByMovie: RequestHandler = async (req, res) => {
    const { params } = (req as any).validated;
    const shows = await moviesService.listShowsByMovie(params.id);
    res.status(HttpStatus.OK).json(shows);
};
