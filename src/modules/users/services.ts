import { pool } from "../../config/db";

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

const deleteUser = async (id: string) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const activeBookingCheck = await client.query(
      `SELECT id 
       FROM bookings 
       WHERE customer_id = $1 AND status = 'active'`,
      [id]
    );

    if (activeBookingCheck.rowCount! > 0) {
      await client.query("ROLLBACK");

      throw new Error("Cannot delete user: Active bookings exist.");
    }

    const deleteResult = await client.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );

    if (deleteResult.rowCount === 0) {
      await client.query("ROLLBACK");
      throw new Error("User not found.");
    }

    await client.query("COMMIT");
    return {
      id: deleteResult.rows[0].id,
      message: "User deleted successfully.",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const userServices = {
  getUser,
  updateUser,
  deleteUser,
};
