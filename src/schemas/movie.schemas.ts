import { z } from "zod";

const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:mm (e.g., 19:30)");

export const createMovieSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        imageUrl: z.string().url().optional(),
        theatreId: z.string().uuid(),

        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD"),

        showTimes: z.array(hhmm).min(1),
        durationMinutes: z.number().int().positive(),

        timezone: z.string().min(1)
    })
});

export const listMoviesSchema = z.object({
    query: z.object({}).optional()
});

export const listShowsByMovieSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});
