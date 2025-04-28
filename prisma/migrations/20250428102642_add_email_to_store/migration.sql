/*
  Warnings:

  - You are about to drop the column `location` on the `store` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` DROP COLUMN `location`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Store_email_key` ON `Store`(`email`);
