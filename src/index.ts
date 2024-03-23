import Kao from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import { memeRouter } from "./routers/meme";
import { healthRouter } from "./routers/health";
import { rmemeRouter } from "./routers/rmeme";
import mysql from "mysql2/promise";
import { MySql2Database, drizzle } from "drizzle-orm/mysql2";
import { auth } from "./middleware/auth";
import dotenv from "dotenv";

dotenv.config();

export const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_TABLE,
  password: process.env.DB_PASSWORD,
});

// export let db: MySql2Database;
export const db = drizzle(connection);

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
