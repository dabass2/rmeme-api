import { datetime, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  user_id: int("user_id").primaryKey().notNull().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  apiKey: varchar("apiKey", { length: 255 }).notNull(),
  accesses: int("accesses").default(0).notNull(),
  lastAccessed: datetime("lastAccessed").notNull().default(new Date()),
  dailyLimit: int("dailyLimit").notNull().default(0),
});
