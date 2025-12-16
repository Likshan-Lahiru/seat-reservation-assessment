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


    if (isPgError(err) && err.code === "23505") {
        switch (err.constraint) {
            case "reservation_items_show_id_seat_id_key":
                return res.status(HttpStatus.CONFLICT).json({
                    error: {
                        code: "ALREADY_RESERVED",
                        message: "These seat(s) are already booked for this show time."
                    }
                });

            case "seats_theatre_id_label_key":
                return res.status(HttpStatus.CONFLICT).json({
                    error: {
                        code: "SEAT_ALREADY_EXISTS",
                        message: "A seat with this label already exists in the theatre."
                    }
                });

            case "users_email_key":
                return res.status(HttpStatus.CONFLICT).json({
                    error: {
                        code: "EMAIL_ALREADY_EXISTS",
                        message: "A user with this email already exists."
                    }
                });

            case "users_nic_key":
                return res.status(HttpStatus.CONFLICT).json({
                    error: {
                        code: "NIC_ALREADY_EXISTS",
                        message: "A user with this NIC already exists."
                    }
                });

            default:
                return res.status(HttpStatus.CONFLICT).json({
                    error: {
                        code: "UNIQUE_VIOLATION",
                        message: "Duplicate value violates a unique constraint.",
                        details: { constraint: err.constraint, detail: err.detail }
                    }
                });
        }
    }


    console.error("Unhandled error:", err);
    return res.status(HttpStatus.INTERNAL).json({
        error: { code: "INTERNAL_ERROR", message: "Something went wrong." }
    });
};
