/*
  Warnings:

  - You are about to drop the column `transactions` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `organizer` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `reviews` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticket_types` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `transactions` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `vouchers` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `PointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `event` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `event` on the `TicketType` table. All the data in the column will be lost.
  - You are about to drop the column `transactions` on the `TicketType` table. All the data in the column will be lost.
  - You are about to drop the column `coupon` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `event` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `ticket_type` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `voucher` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `coupons` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `events` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `point_history` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referrals` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referred_by` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reviews` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `transaction` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `event` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `transactions` on the `Voucher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "transactions",
DROP COLUMN "user";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "organizer",
DROP COLUMN "reviews",
DROP COLUMN "ticket_types",
DROP COLUMN "transactions",
DROP COLUMN "vouchers";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "user";

-- AlterTable
ALTER TABLE "PointHistory" DROP COLUMN "user";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "event",
DROP COLUMN "user";

-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "event",
DROP COLUMN "transactions";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "coupon",
DROP COLUMN "event",
DROP COLUMN "ticket_type",
DROP COLUMN "user",
DROP COLUMN "voucher";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "coupons",
DROP COLUMN "events",
DROP COLUMN "notifications",
DROP COLUMN "point_history",
DROP COLUMN "referrals",
DROP COLUMN "referred_by",
DROP COLUMN "reviews",
DROP COLUMN "transaction";

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "event",
DROP COLUMN "transactions";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "TicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointHistory" ADD CONSTRAINT "PointHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
