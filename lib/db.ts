import { PrismaClient } from "../generated/prisma/client";
import Database from "better-sqlite3";
import { PrismaBetterSQLite } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const filePath = url.replace(/^file:/, "");
  const sqlite = new Database(filePath);
  const adapter = new PrismaBetterSQLite(sqlite);

  return new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

