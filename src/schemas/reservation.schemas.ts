import { z } from "zod";

export const createReservationSchema = z.object({
    body: z.object({
        showId: z.string().uuid(),
        seatIds: z.array(z.string().uuid()).min(1),
        user: z.object({
            name: z.string().min(1),
            email: z.string().email(),
            nic: z.string().min(5)
        })
    })
});

export const listReservationsSchema = z.object({
    query: z.object({
        showId: z.string().uuid().optional(),
        seatId: z.string().uuid().optional(),
        page: z.string().optional(),
        limit: z.string().optional()
    })
});

export const cancelReservationSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});
