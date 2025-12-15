import express from "express";
import cors from "cors";
import helmet from "helmet";

import { routes } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

export function createApp() {
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: "1mb" }));


    app.use(requestLogger);

    app.get("/health", (_req, res) => res.json({ ok: true }));


    app.use("/api", routes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
