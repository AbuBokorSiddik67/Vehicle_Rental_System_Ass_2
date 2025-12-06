import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: config.db_secret,
});

const initDB = async () => {
  await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(200) NOT NULL UNIQUE,
                CHECK (email = LOWER(email)),
                password TEXT NOT NULL,
                CHECK (LENGTH(password) >=6),
                phone VARCHAR(50) NOT NULL,
                role VARCHAR(50) DEFAULT 'customer',
                CHECK (role IN ('admin', 'customer'))
            )
        `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles(
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(100) NOT NULL,
            type VARCHAR(100) DEFAULT 'car',
            CHECK (type IN ('car', 'bike', 'van', 'SUV')),
            registration_number VARCHAR(100) UNIQUE,
            daily_rent_price INT NOT NULL,
            CHECK (daily_rent_price > 0),
            availability_status VARCHAR(20) DEFAULT 'available',
            CHECK (availability_status IN ('available', 'booked'))
        )
    `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings(
                id SERIAL PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE CASCADE,
                vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL,
                total_price INT NOT NULL,
                CHECK (total_price >= 0),
                status VARCHAR(100) DEFAULT 'active',
                CHECK (status IN ('active', 'cancelled', 'returned'))
            )
        `);
};

export default initDB;
