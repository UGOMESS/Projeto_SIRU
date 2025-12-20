-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESEARCHER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('ML', 'L', 'G', 'KG', 'UNID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RESEARCHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reagent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "casNumber" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "formula" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL,
    "minQuantity" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reagent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewedBy" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "requestId" TEXT NOT NULL,
    "reagentId" TEXT NOT NULL,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteContainer" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "currentVolume" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WasteContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteLog" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,

    CONSTRAINT "WasteLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_reagentId_fkey" FOREIGN KEY ("reagentId") REFERENCES "Reagent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteLog" ADD CONSTRAINT "WasteLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteLog" ADD CONSTRAINT "WasteLog_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "WasteContainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
