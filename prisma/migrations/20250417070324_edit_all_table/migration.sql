/*
  Warnings:

  - You are about to drop the column `expires_at` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `PointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `payment_proof` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `referred_by_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `end_date` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Pay` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referred_by_id_fkey";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "expires_at",
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "price",
ADD COLUMN     "Pay" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "PointHistory" DROP COLUMN "source";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "event_id",
DROP COLUMN "expires_at",
DROP COLUMN "payment_proof",
DROP COLUMN "qty",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referred_by_id";

-- DropTable
DROP TABLE "Notification";

-- DropEnum
DROP TYPE "NotificationType";
