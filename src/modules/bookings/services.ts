import { pool } from "../../config/db";


const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const vehicleDetailsResult = await pool.query(
    `SELECT daily_rent_price, availability_status FROM vehicles 
     WHERE id = $1`,
    [vehicle_id]
  );

  const vehicleDetails = vehicleDetailsResult.rows[0];

  if (!vehicleDetails || vehicleDetails.availability_status === "booked") {
    throw new Error("Vehicle is not available or does not exist.");
  }
  const daily_rent_price = vehicleDetails.daily_rent_price;

  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);

  const timeDifference = endDate.getTime() - startDate.getTime();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  let number_of_days = Math.ceil(timeDifference / MS_PER_DAY);
  if (number_of_days === 0) {
    number_of_days = 1;
  }

  const total_price = daily_rent_price * number_of_days;

  const insertResult = await pool.query(
    `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) 
     VALUES($1, $2, $3, $4, $5) 
     RETURNING id`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );
  const newBookingId = insertResult.rows[0].id;

  await pool.query(
    `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
    [vehicle_id]
  );

  const selectQuery = `
    SELECT
      b.*,
      json_build_object('name', u.name, 'email', u.email) AS customer,
      json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) AS vehicle 
    FROM bookings b
    JOIN users u ON b.customer_id = u.id  
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = $1;
`;

  const result = await pool.query(selectQuery, [newBookingId]);
  return result.rows[0];
};

const getUser = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};

const updateUser = async (
  name: string,
  email: string,
  phone: string,
  role: string,
  id: string
) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *`,
    [name, email, phone, role, id]
  );
  return result;
};

export const bookingServices = {
  createBooking,
  getUser,
  updateUser,
};
