import * as seatsRepo from "../repositories/seats.repo";
import { withTransaction } from "../db/withTransaction";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";
import * as moviesRepo from "../repositories/movies.repo";

export async function listSeats(theatreId?: string) {
    return seatsRepo.listSeats(theatreId);
}

export async function createSeat(input: { theatreId: string; label: string }) {
    return seatsRepo.createSeat(input);
}

export async function listSeatsByShow(showId: string) {
    return withTransaction(async (client) => {
        const show = await moviesRepo.getShowById(client, showId);

        if (!show) {
            throw new AppError({
                status: HttpStatus.NOT_FOUND,
                code: "SHOW_NOT_FOUND",
                message: "Show not found"
            });
        }

        const rows = await seatsRepo.listSeatsWithReservationStatusByShow(client, showId);

        return rows.map((r) => ({
            id: r.id,
            theatre_id: r.theatre_id,
            label: r.label,
            created_at: r.created_at,
            reservationStatus: r.reservation_status
        }));
    });
}
