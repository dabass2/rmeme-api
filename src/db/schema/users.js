"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    user_id: (0, mysql_core_1.int)("user_id").primaryKey().notNull().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    apiKey: (0, mysql_core_1.varchar)("apiKey", { length: 255 }).notNull(),
    accesses: (0, mysql_core_1.int)("accesses").default(0).notNull(),
    lastAccessed: (0, mysql_core_1.datetime)("lastAccessed").notNull().default(new Date()),
    dailyLimit: (0, mysql_core_1.int)("dailyLimit").notNull().default(0),
});
