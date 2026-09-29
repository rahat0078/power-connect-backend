import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  backend_url: process.env.BACKEND_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  redis_user: process.env.REDIS_USER!,
  redis_password: process.env.REDIS_PASSWORD!,
  redis_host: process.env.REDIS_HOST!,
  redis_port: process.env.REDIS_PORT!,
  sender_email: process.env.SENDER_EMAIL!,
  smtp_password: process.env.SMTP_PASSWORD!,
  smtp_user: process.env.SMTP_USER!,
  google_client_id: process.env.GOOGLE_CLIENT_ID!,
  seed_admin_email: process.env.SEED_ADMIN_EMAIL!,
  seed_admin_password: process.env.SEED_ADMIN_PASSWORD!,
  seed_admin_name: process.env.SEED_ADMIN_NAME!
};
