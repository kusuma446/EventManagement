-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quota" INTEGER NOT NULL,
    "transactions" TEXT NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);
