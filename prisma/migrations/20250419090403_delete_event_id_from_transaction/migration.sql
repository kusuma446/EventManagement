/*
  Warnings:

  - You are about to drop the column `event_id` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_event_id_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "event_id";
