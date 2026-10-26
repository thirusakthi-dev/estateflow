-- CreateEnum
CREATE TYPE "FollowUpOutcome" AS ENUM ('CALL_BACK', 'INTERESTED', 'SITE_VISIT_PLANNED', 'NEGOTIATION', 'NOT_INTERESTED', 'READY_TO_BOOK');

-- AlterTable
ALTER TABLE "FollowUp" ADD COLUMN     "outcome" "FollowUpOutcome";
