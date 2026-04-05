import cors from "@koa/cors";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import Kao from "koa";
import bodyParser from "koa-bodyparser";
import { auth } from "./middleware/auth";
import { healthRouter } from "./routers/health";
import { memeRouter } from "./routers/meme";
import { rmemeRouter } from "./routers/rmeme";

dotenv.config({ path: [".env.rmeme"] });

const client = createClient({ url: "file:./rmeme.db" });
export const db = drizzle(client);

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
