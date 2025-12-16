import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/appError";
import { HttpStatus } from "../utils/http";

type PgError = {
    code: string;
    detail?: string;
    constraint?: string;
    table?: string;
};

function isPgError(err: any): err is PgError {
    return !!err && typeof err === "object" && typeof err.code === "string";
}

function conflict(code: string, message: string, err: PgError) {
    return {
        error: {
            code,
            message,
            details: { constraint: err.constraint, detail: err.detail, table: err.table }
        }
    };
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {

    if (err instanceof AppError) {
        return res.status(err.status).json({
            error: { code: err.code, message: err.message, details: err.details }
        });
    }


    if (isPgError(err)) {

        if (err.code === "23505") {

            if (err.constraint === "seats_theatre_id_label_key") {
                return res
                    .status(HttpStatus.CONFLICT)
                    .json(conflict("SEAT_ALREADY_EXISTS", "This seat label already exists in this theatre.", err));
            }


            if (err.constraint === "users_email_key") {
                return res
                    .status(HttpStatus.CONFLICT)
                    .json(conflict("USER_EMAIL_EXISTS", "A user with this email already exists.", err));
            }


            if (err.constraint === "users_nic_key") {
                return res
                    .status(HttpStatus.CONFLICT)
                    .json(conflict("USER_NIC_EXISTS", "A user with this NIC already exists.", err));
            }


            if (err.constraint === "reservation_items_show_id_seat_id_key") {
                return res
                    .status(HttpStatus.CONFLICT)
                    .json(conflict("ALREADY_RESERVED", "These seat(s) are already booked for this show time.", err));
            }


            return res
                .status(HttpStatus.CONFLICT)
                .json(conflict("DUPLICATE_RESOURCE", "Duplicate value violates a unique constraint.", err));
        }
    }

    console.error("Unhandled error:", err);
    return res.status(HttpStatus.INTERNAL).json({
        error: { code: "INTERNAL_ERROR", message: "Something went wrong." }
    });
};
