import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const result = await pool.query(
    ` INSERT INTO vehicles(
      vehicle_name, type, registration_number, daily_rent_price, availability_status
    ) VALUES($1, $2, $3, $4, $5) RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  return result;
};

const getVehicle = async () => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result;
};

const singleVehicle = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);
  return result;
};

const updateVehicle = async (
  vehicle_name: string,
  type: string,
  registration_number: string,
  daily_rent_price: number,
  availability_status: string,
  id: string
) => {
  const result = await pool.query(
    `UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      id,
    ]
  );
  return result;
};

const deleteVehicle = async (id: string) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const activeBookingCheck = await client.query(
      `SELECT id 
       FROM bookings 
       WHERE vehicle_id = $1 AND status = 'active'`,
      [id]
    );

    if (activeBookingCheck.rowCount! > 0) {
      await client.query("ROLLBACK");

      throw new Error(
        "Cannot delete vehicle: Active bookings exist for this vehicle."
      );
    }

    const deleteResult = await client.query(
      `DELETE FROM vehicles WHERE id = $1 RETURNING id, vehicle_name`,
      [id]
    );

    if (deleteResult.rowCount === 0) {
      await client.query("ROLLBACK");
      throw new Error("Vehicle not found.");
    }

    await client.query("COMMIT");

    return {
      id: deleteResult.rows[0].id,
      vehicle_name: deleteResult.rows[0].vehicle_name,
      message: "Vehicle deleted successfully.",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const vehicleServices = {
  createVehicle,
  getVehicle,
  singleVehicle,
  updateVehicle,
  deleteVehicle,
};
