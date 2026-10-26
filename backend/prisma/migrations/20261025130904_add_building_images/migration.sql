-- CreateTable
CREATE TABLE "BuildingImage" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "alt" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildingImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuildingImage_publicId_key" ON "BuildingImage"("publicId");

-- CreateIndex
CREATE INDEX "BuildingImage_buildingId_sortOrder_idx" ON "BuildingImage"("buildingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "BuildingImage" ADD CONSTRAINT "BuildingImage_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
