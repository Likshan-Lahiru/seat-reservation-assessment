export const openapi = {
    openapi: "3.0.3",
    info: {
        title: "BookMyTicket API",
        version: "1.0.0"
    },
    servers: [{ url: "/api" }],
    components: {
        schemas: {
            ErrorResponse: {
                type: "object",
                properties: {
                    error: {
                        type: "object",
                        properties: {
                            code: { type: "string" },
                            message: { type: "string" },
                            details: { type: "object", additionalProperties: true }
                        },
                        required: ["code", "message"]
                    }
                },
                required: ["error"]
            },

            CreateTheatreBody: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string", example: "Scope Cinemas - Colombo" },
                    imageUrl: { type: "string", example: "https://example.com/theatre.jpg" },
                    rating: { type: "number", example: 4.6 },
                    location: { type: "string", example: "Colombo, Sri Lanka" }
                }
            },

            CreateSeatBody: {
                type: "object",
                required: ["theatreId", "label"],
                properties: {
                    theatreId: { type: "string", format: "uuid" },
                    label: { type: "string", example: "A1" }
                }
            },

            CreateMovieBody: {
                type: "object",
                required: ["title", "theatreId", "startDate", "endDate", "showTimes", "durationMinutes", "timezone"],
                properties: {
                    title: { type: "string", example: "Interstellar" },
                    imageUrl: { type: "string", example: "https://example.com/interstellar.jpg" },
                    theatreId: { type: "string", format: "uuid" },
                    startDate: { type: "string", example: "2025-12-15" },
                    endDate: { type: "string", example: "2025-12-21" },
                    showTimes: { type: "array", items: { type: "string" }, example: ["10:00", "14:00", "19:00"] },
                    durationMinutes: { type: "integer", example: 150 },
                    timezone: { type: "string", example: "Asia/Colombo" }
                }
            },

            CreateReservationBody: {
                type: "object",
                required: ["showId", "seatIds", "user"],
                properties: {
                    showId: { type: "string", format: "uuid" },
                    seatIds: { type: "array", items: { type: "string", format: "uuid" } },
                    user: {
                        type: "object",
                        required: ["name", "email", "nic"],
                        properties: {
                            name: { type: "string", example: "Likshan Lahiru" },
                            email: { type: "string", example: "lahiru@example.com" },
                            nic: { type: "string", example: "200012345678" }
                        }
                    }
                }
            }
        }
    },
    paths: {
        "/health": {
            get: {
                summary: "Health check",
                responses: { 200: { description: "OK" } }
            }
        },

        "/theatres": {
            get: { summary: "List theatres", responses: { 200: { description: "OK" } } },
            post: {
                summary: "Create theatre",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTheatreBody" } } }
                },
                responses: {
                    201: { description: "Created" },
                    422: { description: "Validation", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },

        "/seats": {
            get: {
                summary: "List seats (optionally by theatreId)",
                parameters: [
                    { name: "theatreId", in: "query", schema: { type: "string", format: "uuid" }, required: false }
                ],
                responses: { 200: { description: "OK" } }
            },
            post: {
                summary: "Create seat",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSeatBody" } } }
                },
                responses: {
                    201: { description: "Created" },
                    409: { description: "Duplicate seat label", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },

        "/seats/by-show/{showId}": {
            get: {
                summary: "List seats by show with reservationStatus",
                parameters: [{ name: "showId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
                responses: { 200: { description: "OK" } }
            }
        },

        "/movies": {
            get: { summary: "List movies with shows", responses: { 200: { description: "OK" } } },
            post: {
                summary: "Create movie with generated shows",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CreateMovieBody" } } }
                },
                responses: {
                    201: { description: "Created" },
                    422: { description: "Validation", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },

        "/movies/{id}/shows": {
            get: {
                summary: "List shows by movie",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
                responses: { 200: { description: "OK" } }
            }
        },

        "/reservations": {
            get: {
                summary: "List reservations (filters + pagination)",
                parameters: [
                    { name: "showId", in: "query", schema: { type: "string", format: "uuid" } },
                    { name: "seatId", in: "query", schema: { type: "string", format: "uuid" } },
                    { name: "page", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "string" } }
                ],
                responses: { 200: { description: "OK" } }
            },
            post: {
                summary: "Create reservation",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CreateReservationBody" } } }
                },
                responses: {
                    201: { description: "Created" },
                    409: { description: "Seat already reserved", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },

        "/reservations/{id}": {
            delete: {
                summary: "Cancel reservation",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
                responses: { 204: { description: "No Content" }, 404: { description: "Not found" } }
            }
        }
    }
} as const;
