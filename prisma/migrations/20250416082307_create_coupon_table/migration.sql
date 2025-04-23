-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "transactions" TEXT NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
