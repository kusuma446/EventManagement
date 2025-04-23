/*
  Warnings:

  - Added the required column `event_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "event_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "point" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrer_Id" TEXT NOT NULL,
    "referred_Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrer_Id_referred_Id_key" ON "Referral"("referrer_Id", "referred_Id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrer_Id_fkey" FOREIGN KEY ("referrer_Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referred_Id_fkey" FOREIGN KEY ("referred_Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
