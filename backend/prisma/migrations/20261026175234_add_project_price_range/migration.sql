-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "agreedPrice" DECIMAL(14,2),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "maxPrice" DECIMAL(14,2),
ADD COLUMN     "minPrice" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "maxPrice" DECIMAL(14,2),
ADD COLUMN     "minPrice" DECIMAL(14,2);
