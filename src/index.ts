import cors from "@koa/cors";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import Kao from "koa";
import bodyParser from "koa-bodyparser";
import mysql from "mysql2/promise";
import { auth } from "./middleware/auth";
import { healthRouter } from "./routers/health";
import { memeRouter } from "./routers/meme";
import { rmemeRouter } from "./routers/rmeme";

dotenv.config({ path: [".env.rmeme"] });

export const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_TABLE,
  password: process.env.DB_PASSWORD,
});

export const db = drizzle(connection, {
  logger: process.env.NODE_ENV !== "production",
});

const app = new Kao();

app.use(cors());

app.use(bodyParser());

app.use(healthRouter.routes()).use(healthRouter.allowedMethods());

app.use(rmemeRouter.routes()).use(rmemeRouter.allowedMethods());

app.use(auth);

app.use(memeRouter.routes()).use(memeRouter.allowedMethods());

app.listen("9000", () => {
  console.log(`Server running on port 9000`);
});
