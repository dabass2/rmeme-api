import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  user_id: integer("user_id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull(),
  name: text("name").notNull(),
  apiKey: text("apiKey").notNull(),
  accesses: integer("accesses", { mode: "number" }).default(0).notNull(),
  lastAccessed: text("lastAccessed")
    .notNull()
    .default(sql`(datetime('now'))`),
  dailyLimit: integer("dailyLimit", { mode: "number" }).notNull().default(0),
});
