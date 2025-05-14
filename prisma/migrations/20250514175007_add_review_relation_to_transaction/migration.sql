/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Review_transaction_id_key" ON "Review"("transaction_id");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
