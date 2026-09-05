-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "isTestData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "roomTypeId" TEXT,
    "isTestData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "pricePerNight" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "isTestData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "roomsOpen" INTEGER NOT NULL,
    "isTestData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelInfo" (
    "id" TEXT NOT NULL,
    "factSheet" TEXT NOT NULL,
    "checkInTime" TEXT NOT NULL,
    "checkOutTime" TEXT NOT NULL,
    "outletOpenTime" TEXT NOT NULL,
    "outletCloseTime" TEXT NOT NULL,
    "outletName" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "reservationsEmail" TEXT NOT NULL,
    "isTestData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HotelInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "stayDateFrom" TIMESTAMP(3) NOT NULL,
    "stayDateTo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "isTestData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "flutterwaveRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFlag" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchMiss" (
    "id" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchMiss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySearchEvent" (
    "id" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilitySearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Handoff" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "guestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Handoff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_phoneNumber_key" ON "Guest"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_roomTypeId_date_key" ON "Availability"("roomTypeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_confirmationCode_key" ON "Booking"("confirmationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_flutterwaveRef_key" ON "Payment"("flutterwaveRef");

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "ContentFlag_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
