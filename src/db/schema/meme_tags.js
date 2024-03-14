"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meme_tags = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const memes_1 = require("./memes");
exports.meme_tags = (0, mysql_core_1.mysqlTable)("meme_tags", {
    tag_id: (0, mysql_core_1.int)("tag_id").primaryKey().notNull().autoincrement(),
    tag: (0, mysql_core_1.varchar)("tag", { length: 255 }).notNull(),
    meme_id: (0, mysql_core_1.int)("meme_id").references(() => memes_1.memes.meme_id),
});
