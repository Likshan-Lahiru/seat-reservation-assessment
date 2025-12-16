import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { routes } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { openapi } from "./docs/openapi";

export function createApp() {
    const app = express();


    app.use(helmet());


    app.use(
        cors({
            origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
            credentials: false,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );


    app.use(express.json({ limit: "1mb" }));


    app.use(requestLogger);


    app.get("/health", (_req, res) => res.json({ ok: true }));


    app.get("/docs.json", (_req, res) => res.json(openapi));
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));


    app.use("/api", routes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
