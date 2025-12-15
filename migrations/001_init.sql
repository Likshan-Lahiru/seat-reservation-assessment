
CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TABLE theatres (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name TEXT NOT NULL,
                          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seats (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       theatre_id UUID NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
                       label TEXT NOT NULL,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       UNIQUE (theatre_id, label)
);

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name TEXT NOT NULL,
                       email TEXT NOT NULL,
                       nic TEXT NOT NULL,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       UNIQUE (email),
                       UNIQUE (nic)
);


CREATE TABLE movies (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        title TEXT NOT NULL,
                        image_url TEXT,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE shows (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                       theatre_id UUID NOT NULL REFERENCES theatres(id) ON DELETE RESTRICT,
                       start_time TIMESTAMPTZ NOT NULL,
                       end_time TIMESTAMPTZ NOT NULL,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       CONSTRAINT show_time_valid CHECK (end_time > start_time)
);


CREATE TABLE reservations (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              show_id UUID NOT NULL REFERENCES shows(id) ON DELETE RESTRICT,
                              user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE reservation_items (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
                                   show_id UUID NOT NULL REFERENCES shows(id) ON DELETE RESTRICT,
                                   seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
                                   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                   UNIQUE (show_id, seat_id)
);


CREATE INDEX idx_seats_theatre_id ON seats(theatre_id);
CREATE INDEX idx_shows_movie_id ON shows(movie_id);
CREATE INDEX idx_shows_theatre_id ON shows(theatre_id);
CREATE INDEX idx_reservations_show_id ON reservations(show_id);
CREATE INDEX idx_items_reservation_id ON reservation_items(reservation_id);
CREATE INDEX idx_items_show_id ON reservation_items(show_id);
CREATE INDEX idx_items_seat_id ON reservation_items(seat_id);
