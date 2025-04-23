/*
  Warnings:

  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACCEPTED', 'REJECTED', 'EXPIRED', 'OTHER');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;
