-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "deletedAt" TIMESTAMP(3);
