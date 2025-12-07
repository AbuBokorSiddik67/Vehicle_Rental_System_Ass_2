import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import config from "../../config";

const userCreate = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;
  const lowerCaseEmail = (email as string).toLowerCase();
  const hasedPass = await bcrypt.hash(password as string, 10);
  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role`,
    [name, lowerCaseEmail, hasedPass, phone, role]
  );
  return result;
};

const userLogin = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return false;
  }
  const tokenData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const token = jwt.sign(tokenData, config.token_secret as string, {
    expiresIn: "7d",
  });
  return {token, user};
};

export const authServices = {
  userCreate,
  userLogin,
};
