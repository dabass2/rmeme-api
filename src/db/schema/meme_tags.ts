import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { memes } from "./memes";

export const meme_tags = mysqlTable("meme_tags", {
  tag_id: int("tag_id").primaryKey().notNull().autoincrement(),
  tag: varchar("tag", { length: 255 }).notNull(),
  meme_id: int("meme_id").references(() => memes.meme_id),
});
