/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ProjectImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `PropertyUnitImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `ProjectImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `PropertyUnitImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyUnitImage" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectImage_publicId_key" ON "ProjectImage"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyUnitImage_publicId_key" ON "PropertyUnitImage"("publicId");
