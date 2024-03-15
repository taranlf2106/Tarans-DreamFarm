CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE "pets" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pet_name VARCHAR(255) NOT NULL,
    pet_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
