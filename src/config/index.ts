import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT,
  db_secret: process.env.DB_SECRET,
  token_secret: process.env.TOKEN_SECRET,
};

export default config;
