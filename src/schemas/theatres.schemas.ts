import { z } from "zod";

export const createTheatreSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        imageUrl: z.string().url().optional(),
        rating: z.number().min(0).max(5).optional(),
        location: z.string().min(1).optional()
    })
});
