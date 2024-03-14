import { Context, Next } from "koa";
import { db } from "..";
import { users } from "../db/schema/users";
import { eq, sql } from "drizzle-orm";

export async function auth(ctx: Context, next: Next) {
  if (ctx.originalUrl === "/meme/swagger-html") await next();

  const passedInKey = (ctx.headers["x-api-key"] as string) ?? "";
  const response = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, passedInKey));

  ctx.assert(response && response.length, 401);

  const user = response[0];
  const currTime = new Date();
  const underApiLimit = user.accesses < user.dailyLimit;
  const sameDay =
    user.lastAccessed.getDay() === currTime.getDay() &&
    user.lastAccessed.getMonth() === currTime.getMonth() &&
    user.lastAccessed.getFullYear() === currTime.getFullYear();

  console.log(sameDay, underApiLimit);
  ctx.assert(underApiLimit && sameDay, 429);

  ctx.append("user", JSON.stringify(response?.at(0) ?? {}));

  await next();

  await db
    .update(users)
    .set({
      accesses: sql`${users.accesses} + 1`,
      lastAccessed: new Date(),
    })
    .where(eq(users.apiKey, passedInKey));

  ctx.remove("user");
  ctx.append("x-rate-limit", String(user.dailyLimit - (user.accesses + 1)));
}
