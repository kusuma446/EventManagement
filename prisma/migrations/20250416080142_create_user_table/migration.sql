-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "profile_pict" TEXT,
    "referral_code" TEXT NOT NULL,
    "referred_by" TEXT NOT NULL,
    "referred_by_id" TEXT,
    "referrals" TEXT NOT NULL,
    "transaction" TEXT NOT NULL,
    "coupons" TEXT NOT NULL,
    "point_history" TEXT NOT NULL,
    "reviews" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "notifications" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "User"("referral_code");
