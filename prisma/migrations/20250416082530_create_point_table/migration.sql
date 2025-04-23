-- CreateTable
CREATE TABLE "PointHistory" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointHistory_pkey" PRIMARY KEY ("id")
);
