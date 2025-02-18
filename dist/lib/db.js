import { PrismaClient } from "@prisma/client";
// Ensure that there's only one instance of PrismaClient
let prisma;
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
}
else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}
export const db = prisma;
