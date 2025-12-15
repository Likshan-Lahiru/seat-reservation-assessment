import * as theatresRepo from "../repositories/theatres.repo";

export async function listTheatres() {
    return theatresRepo.listTheatres();
}

export async function createTheatre(input: {
    name: string;
    imageUrl?: string;
    rating?: number;
    location?: string;
}) {
    return theatresRepo.createTheatre(input);
}
