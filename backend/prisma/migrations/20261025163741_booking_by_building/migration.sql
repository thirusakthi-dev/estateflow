/*
  Warnings:

  - You are about to drop the column `unitId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `buildingId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_unitId_fkey";

-- DropIndex
DROP INDEX "Booking_unitId_status_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "unitId",
ADD COLUMN     "buildingId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_buildingId_status_idx" ON "Booking"("buildingId", "status");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
