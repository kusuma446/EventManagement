-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "ticket_type" TEXT NOT NULL,
    "ticket_type_id" TEXT,
    "qty" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "used_points" INTEGER NOT NULL DEFAULT 0,
    "voucher" TEXT,
    "voucher_id" TEXT,
    "coupon" TEXT,
    "coupon_id" TEXT,
    "payment_proof" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
