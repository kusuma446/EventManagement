-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
