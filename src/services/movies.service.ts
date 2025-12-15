import { DateTime } from "luxon";
import { withTransaction } from "../db/withTransaction";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";
import * as moviesRepo from "../repositories/movies.repo";

function daysBetweenInclusive(startISO: string, endISO: string): string[] {
    const start = DateTime.fromISO(startISO);
    const end = DateTime.fromISO(endISO);
    if (!start.isValid || !end.isValid) return [];
    if (end < start) return [];

    const days: string[] = [];
    let d = start.startOf("day");
    const last = end.startOf("day");
    while (d <= last) {
        days.push(d.toISODate()!);
        d = d.plus({ days: 1 });
    }
    return days;
}

export async function createMovieWithShows(input: {
    title: string;
    imageUrl?: string;
    theatreId: string;

    startDate: string;
    endDate: string;
    showTimes: string[];
    durationMinutes: number;
    timezone: string;
}) {
    const days = daysBetweenInclusive(input.startDate, input.endDate);

    if (days.length === 0) {
        throw new AppError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATE_RANGE",
            message: "endDate must be same or after startDate"
        });
    }

    return withTransaction(async (client) => {
        const movie = await moviesRepo.createMovie(client, {
            title: input.title,
            imageUrl: input.imageUrl
        });

        const starts: string[] = [];
        const ends: string[] = [];

        for (const day of days) {
            for (const t of input.showTimes) {
                const startDT = DateTime.fromISO(`${day}T${t}`, { zone: input.timezone });

                if (!startDT.isValid) {
                    throw new AppError({
                        status: HttpStatus.BAD_REQUEST,
                        code: "INVALID_SHOW_TIME",
                        message: `Invalid show time: ${day} ${t} (${input.timezone})`
                    });
                }

                const endDT = startDT.plus({ minutes: input.durationMinutes });

                starts.push(startDT.toUTC().toISO()!);
                ends.push(endDT.toUTC().toISO()!);
            }
        }

        const shows = await moviesRepo.createShowsBulk(client, {
            movieId: movie.id,
            theatreId: input.theatreId,
            starts,
            ends
        });

        return { movie, shows };
    });
}

export async function listMovies() {
    return moviesRepo.listMoviesWithShows();
}

export async function listShowsByMovie(movieId: string) {
    return moviesRepo.listShowsByMovie(movieId);
}
