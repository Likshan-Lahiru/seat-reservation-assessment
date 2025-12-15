import { withTransaction } from "../db/withTransaction";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";
import { parsePagination } from "../utils/pagination";
import * as usersRepo from "../repositories/users.repo";
import * as moviesRepo from "../repositories/movies.repo";
import * as seatsRepo from "../repositories/seats.repo";
import * as reservationsRepo from "../repositories/reservations.repo";

export async function createReservation(input: {
    showId: string;
    seatIds: string[];
    user: { name: string; email: string; nic: string };
}) {
    return withTransaction(async (client) => {
        const show = await moviesRepo.getShowById(client, input.showId);
        if (!show) {
            throw new AppError({
                status: HttpStatus.NOT_FOUND,
                code: "SHOW_NOT_FOUND",
                message: "Show not found"
            });
        }


        try {
            await seatsRepo.validateSeatsBelongToTheatre(client, show.theatre_id, input.seatIds);
        } catch (e: any) {
            throw new AppError({
                status: HttpStatus.BAD_REQUEST,
                code: "INVALID_SEATS",
                message: e?.message ?? "Invalid seats for theatre"
            });
        }

        const user = await usersRepo.findOrCreateUser(client, input.user);

        const reservation = await reservationsRepo.createReservationHeader(client, {
            showId: input.showId,
            userId: user.id
        });

        await reservationsRepo.insertReservationItems(client, {
            reservationId: reservation.id,
            showId: input.showId,
            seatIds: input.seatIds
        });

        return {
            id: reservation.id,
            showId: reservation.show_id,
            userId: reservation.user_id,
            createdAt: reservation.created_at
        };
    });
}

export async function listReservations(input: {
    showId?: string;
    seatId?: string;
    page?: string;
    limit?: string;
}) {
    const { page, limit, offset } = parsePagination({ page: input.page, limit: input.limit });

    return withTransaction(async (client) => {
        const rows = await reservationsRepo.listReservations(client, {
            showId: input.showId,
            seatId: input.seatId,
            limit,
            offset
        });

        return {
            page,
            limit,
            count: rows.length,
            data: rows.map((r) => ({
                id: r.reservation_id,
                showId: r.show_id,
                userId: r.user_id,
                createdAt: r.created_at,
                user: r.user,
                movie: r.movie,
                show: r.show,
                seats: r.seats
            }))
        };
    });
}

export async function cancelReservation(reservationId: string) {
    return withTransaction(async (client) => {
        const existing = await reservationsRepo.getReservationById(client, reservationId);
        if (!existing) {
            throw new AppError({
                status: HttpStatus.NOT_FOUND,
                code: "RESERVATION_NOT_FOUND",
                message: "Reservation not found"
            });
        }

        await reservationsRepo.deleteReservationById(client, reservationId);
        return { deleted: true };
    });
}
