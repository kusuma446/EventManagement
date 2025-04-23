-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "ticket_types" TEXT NOT NULL,
    "transactions" TEXT NOT NULL,
    "reviews" TEXT NOT NULL,
    "vouchers" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
