import { z } from "zod";

export const listSeatsSchema = z.object({
    query: z.object({
        theatreId: z.string().uuid().optional()
    })
});

export const createSeatSchema = z.object({
    body: z.object({
        theatreId: z.string().uuid(),
        label: z.string().min(1)
    })
});
