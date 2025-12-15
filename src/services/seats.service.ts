import * as seatsRepo from "../repositories/seats.repo";

export async function listSeats(theatreId?: string) {
    return seatsRepo.listSeats(theatreId);
}

export async function createSeat(input: { theatreId: string; label: string }) {
    return seatsRepo.createSeat(input);
}
