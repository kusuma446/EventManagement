-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "transactions" TEXT NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);
