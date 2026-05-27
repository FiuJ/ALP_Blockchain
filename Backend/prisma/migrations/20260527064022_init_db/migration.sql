-- CreateTable
CREATE TABLE `Doctor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `walletAddress` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `doctorLicenseNumber` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `clinicName` VARCHAR(191) NOT NULL,
    `clinicLocation` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Doctor_walletAddress_key`(`walletAddress`),
    UNIQUE INDEX `Doctor_doctorLicenseNumber_key`(`doctorLicenseNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `walletAddress` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `isRegistered` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Patient_walletAddress_key`(`walletAddress`),
    UNIQUE INDEX `Patient_patientId_key`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicalDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documentHash` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `documentDescription` TEXT NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiredAt` DATETIME(3) NULL,
    `issuerWallet` VARCHAR(191) NOT NULL,
    `patientWallet` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MedicalDocument_documentHash_key`(`documentHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MedicalDocument` ADD CONSTRAINT `MedicalDocument_issuerWallet_fkey` FOREIGN KEY (`issuerWallet`) REFERENCES `Doctor`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalDocument` ADD CONSTRAINT `MedicalDocument_patientWallet_fkey` FOREIGN KEY (`patientWallet`) REFERENCES `Patient`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;
