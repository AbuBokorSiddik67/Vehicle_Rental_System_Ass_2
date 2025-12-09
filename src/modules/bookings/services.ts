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
      json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) AS vehicle 
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id 
    WHERE b.id = $1;
`;

  const result = await pool.query(selectQuery, [newBookingId]);
  return result.rows[0];
};

const getBooking = async (user: Record<string, unknown>) => {
  if (user?.role === "admin") {
    const selectQuery = `
    SELECT
      b.*,
      json_build_object('name', u.name, 'email', u.email) AS customer,
      json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) AS vehicle 
    FROM bookings b
    JOIN users u ON b.customer_id = u.id  
    JOIN vehicles v ON b.vehicle_id = v.id
    ORDER BY b.id DESC;
`;
    const result = await pool.query(selectQuery);
    return result.rows;
  } else {
    const query = `
        SELECT
            b.*,
            json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) AS vehicle
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.customer_id = $1
        ORDER BY b.rent_start_date DESC;
    `;

    const result = await pool.query(query, [user?.id]);
    return result.rows;
  }
};

const updateBooking = async (
  id: string,
  newStatus: string,
  role: string,
  userId: string 
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentBookingResult = await client.query(
      `SELECT customer_id, vehicle_id, rent_start_date, status 
       FROM bookings 
       WHERE id = $1`,
      [id]
    );

    const currentBooking = currentBookingResult.rows[0];

    if (!currentBooking) {
      throw new Error("Booking not found.");
    }

    const {
      customer_id,
      vehicle_id,
      rent_start_date,
      status: currentStatus,
    } = currentBooking;

    if (role === "customer" && newStatus === "cancelled") {
      if (customer_id !== userId) {
        throw new Error(
          "Authorization error: Not permitted to cancel this booking."
        );
      }

      const today = new Date();
      const rentStartDate = new Date(rent_start_date);

      if (rentStartDate < today) {
        throw new Error(
          "Cancellation failed: Booking period has already started."
        );
      }

      if (currentStatus !== "active") {
        throw new Error(
          `Cancellation failed: Booking is already ${currentStatus}.`
        );
      }

      const updateBookingQuery = `
          UPDATE bookings SET status='cancelled' WHERE id=$1 RETURNING *;
      `;
      const updateVehicleQuery = `
          UPDATE vehicles SET availability_status = 'available' WHERE id = $1;
      `;

      await client.query(updateBookingQuery, [id]);
      await client.query(updateVehicleQuery, [vehicle_id]);

      await client.query("COMMIT");
      return {
        success: true,
        message: "Booking cancelled successfully. Vehicle is available.",
      };
    }

    if (role === "admin" && newStatus === "returned") {
      if (currentStatus !== "active") {
        throw new Error(
          `Marking as returned failed: Booking is already ${currentStatus}.`
        );
      }
      const updateBookingQuery = `
          UPDATE bookings 
          SET status=$1 
          WHERE id=$2 RETURNING total_price;
      `;
      await client.query(updateBookingQuery, [newStatus, id]);

      const updateVehicleQuery = `
          UPDATE vehicles 
          SET availability_status = 'available' 
          WHERE id = $1
      `;
      await client.query(updateVehicleQuery, [vehicle_id]);

      await client.query("COMMIT");

      return {
        success: true,
        message: "Booking marked as returned. Vehicle is now available.",
      };
    }

    if (role === "admin" && newStatus === "returned") {
      const updateQuery = `UPDATE bookings SET status=$1 WHERE id=$2 AND status='active' RETURNING *;`;
      await client.query(updateQuery, [newStatus, id]);

      const updateVehicleQuery = `UPDATE vehicles SET availability_status = 'available' WHERE id = $1;`;
      await client.query(updateVehicleQuery, [vehicle_id]);

      await client.query("COMMIT");
      return { success: true, message: "Booking auto-marked as returned." };
    }

    await client.query("ROLLBACK");
    throw new Error(
      `Invalid update: Role '${role}' cannot set status to '${newStatus}' under current conditions.`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,
  getBooking,
  updateBooking,
};
