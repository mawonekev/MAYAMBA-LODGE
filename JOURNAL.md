# Mayamba Lodge Engineering Journal

## 1. Project Overview & Objective
Mayamba Lodge is an authentic riverside safari sanctuary web application built to solve front desk phone delays and manual booking friction. The application runs strictly against Mayamba Lodge's verified PostgreSQL database records, with zero AI composing or guessing answers, and automated refusal routing to reservations whenever records are silent or private questions arise.

Version one operates on demonstration test data (flagged with `isTestData: true`), covering all guest-facing search and booking flows, payment processing via Flutterwave, isolated staff administration, and success metrics tracking.

---

## 2. Technical Stack & Locked Decisions
- **Framework**: Next.js 15 (App Router with TypeScript)
- **Database & ORM**: PostgreSQL with Prisma ORM 6
- **Database Engine**: Embedded/Local PostgreSQL instance initialized in `.pg-data`
- **Styling**: Vanilla CSS with custom properties (`src/app/globals.css`)
- **Authentication**:
  - Guest: Phone number + Password or SMS One-Time Code (10-minute expiry, strict single-use flag)
  - Staff: Dedicated `Staff` model with isolated session cookie (`mayamba_staff_session`), zero cross-path with guest auth
- **Payments**: Flutterwave integration with atomic database transactions preventing overbooking and duplicate webhook rejection

---

## 3. Implementation Steps & Commit Timeline

### Step 1: Prisma Schema, Database Migrations & Test Data Seeding
- **Commit**: `d1b6a57`
- **PRD Coverage**: Section 8 (Data Model) & Section 6 (Seed prerequisites)
- **Work Executed**:
  - Implemented 14 models: `Guest`, `OtpCode`, `Staff`, `RoomType`, `Photo`, `Rate`, `Availability`, `HotelInfo`, `Booking`, `Payment`, `ContentFlag`, `SearchMiss`, `AvailabilitySearchEvent`, `Handoff`.
  - Configured PostgreSQL datasource and executed initial Prisma migration (`20260905141803_init`).
  - Implemented `prisma/seed.ts` seeding test records across `HotelInfo`, `RoomType` (Luxury River Chalet, Executive Safari Suite, Family Bush Villa), `Photo`, `Rate`, 90 days of daily `Availability`, and default staff account (`admin` / `admin123`).
  - Added TODO-DECISION comment regarding currency selection (defaulted to USD as standard for Zimbabwe safari lodges).

### Step 2: Guest Authentication (Phone Number, Password & SMS OTP)
- **Commit**: `ecc4e03`
- **PRD Coverage**: Section 6 (FR-6) & Section 8 (Guest Auth & OtpCode)
- **Work Executed**:
  - Built `src/lib/sms.ts` stubbing `sendSmsOtp` function with clear development console logging.
  - Implemented `src/lib/guest-auth.ts` with bcrypt password hashing and jose JWT session tokens (`mayamba_guest_session`).
  - Implemented OTP code generation, 10-minute expiry check, and immediate `used: true` flag updates to prevent reuse.
  - Created API routes: `/api/guest/auth/signup`, `/api/guest/auth/signin-password`, `/api/guest/auth/send-otp`, `/api/guest/auth/verify-otp`, `/api/guest/auth/me`, `/api/guest/auth/logout`.
  - Built automated test script `scripts/test-guest-auth.ts` verifying password sign-up, verification, OTP generation, OTP validation, and replay rejection.

### Step 3: Isolated Staff Authentication
- **Commit**: `3d9ad34`
- **PRD Coverage**: Section 4 (Staff Persona) & Section 8 (Staff Auth)
- **Work Executed**:
  - Built `src/lib/staff-auth.ts` completely isolated from guest auth.
  - Created distinct session cookie `mayamba_staff_session` with strict token typing (`type: 'staff'`).
  - Created API routes: `/api/staff/auth/login`, `/api/staff/auth/me`, `/api/staff/auth/logout`.
  - Built automated test script `scripts/test-staff-auth.ts` verifying staff credentials and asserting that guest tokens are rejected by staff validators and staff tokens are rejected by guest validators.

### Step 4: Guest-Facing Screens (FR-1 through FR-7)
- **Commit**: `0e3c436`
- **PRD Coverage**: Section 6 (FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7)
- **Work Executed**:
  - Created luxury safari design system in `src/app/globals.css` with responsive mobile-first typography, earthy neutrals, and gold highlights.
  - Built `src/components/RefusalCard.tsx` rendering dynamic WhatsApp and Email contacts from `HotelInfo`.
  - Built `src/components/GuestNavbar.tsx` and `src/components/GuestFooter.tsx`.
  - Built screens and APIs:
    - Availability Calendar Search (`/guest/availability` & `/api/guest/availability`): logs `AvailabilitySearchEvent` on every query, logs `SearchMiss` when 0 rooms are available.
    - Accommodations & Published Rates (`/guest/rooms`, `/guest/rooms/[id]` & `/api/guest/rooms/[id]`).
    - Lodge Fact Sheet & Schedules (`/guest/hotel-info` & `/api/guest/hotel-info`).
    - Checkout & Payment Screen (`/guest/booking/checkout`).
    - Reservation Status & Payment Receipt (`/guest/payment/[bookingId]`).
    - Reservation History (`/guest/bookings` & `/api/guest/bookings`): strictly scoped to signed-in guest.
    - Guest Portal Sign-in / Sign-up (`/guest/auth`).
    - Content Flag Submission (`/guest/flag` & `/api/guest/flags`): allows guests to flag inaccurate content to front desk.

### Step 5: Payment Flow & Flutterwave Webhook (FR-4)
- **Commit**: `d73e284`
- **PRD Coverage**: Section 6 (FR-4) & Section 8 (Payments & Webhook)
- **Work Executed**:
  - Built `src/lib/payment.ts` executing atomic database transaction (`prisma.$transaction`):
    1. Re-checks `Availability.roomsOpen > 0` inside the transaction for all dates.
    2. Decrements `roomsOpen` by 1.
    3. Fails cleanly with `room_no_longer_available` if `roomsOpen` is 0 at that exact moment without charging the guest.
    4. Generates unique confirmation code (`MYB-XXXXXX`) and creates `Booking` and `Payment` records.
  - Built Flutterwave Webhook (`src/app/api/webhooks/flutterwave/route.ts`):
    - Validates `verif-hash` signature.
    - Enforces unique constraint on `flutterwaveRef`, strictly rejecting duplicate deliveries (HTTP 409).
    - Updates payment status (`paid`, `not_paid`, `unclear_pending_review`).
  - Added payment simulation endpoint (`/api/guest/payments/[paymentId]/simulate`) for pilot testing.

### Step 6: Centralized Refusal Behavior (Section 6)
- **Commit**: `3628706`
- **PRD Coverage**: Section 6 (Refusal Rules & Handoff)
- **Work Executed**:
  - Built `src/lib/refusal.ts` providing `triggerHandoff()`:
    - Reads `whatsappNumber` and `reservationsEmail` dynamically from `HotelInfo`.
    - Persists a `Handoff` row with reasons: `records_silent`, `refund_or_dispute`, `payment_unclear`.
    - Guarantees no screen hardcodes contact details or skips logging handoffs.
  - Built `/api/guest/refusal/route.ts`.
  - Created automated test `scripts/test-payment-and-refusal.ts` verifying atomic decrement, race failure, and handoff logging.

### Step 7: Staff Admin Panel Screens (FR-8 through FR-13)
- **Commit**: `240746e`
- **PRD Coverage**: Section 6 (FR-8, FR-9, FR-10, FR-11, FR-12, FR-13)
- **Work Executed**:
  - Built `src/components/StaffNavbar.tsx`.
  - Built Staff Login (`/staff/login` & `/api/staff/auth/login`).
  - Built Availability Management (`/staff/availability` & `/api/staff/availability`, `/api/staff/availability/bulk`): inspect room counts, inline adjust, bulk update date ranges.
  - Built Rate Management (`/staff/rates` & `/api/staff/rates`): publish seasonal tariffs with validity date windows.
  - Built Content Management (`/staff/content`, `/api/staff/content`, `/api/staff/content/photos`): edit fact sheet, dining hours, WhatsApp number, reservations email, and upload/delete photos.
  - Built Guest Sign Up Review (`/staff/guests` & `/api/staff/guests`): view registered phone numbers, dates, and booking tallies.
  - Built Content Flag Review (`/staff/flags` & `/api/staff/flags/[id]`): review guest flags and toggle status between open and resolved.
  - Built Payment Status View (`/staff/payments` & `/api/staff/payments`): audit payments, filter by status, view Flutterwave references.

### Step 8: Success Metrics Queries and Admin Dashboard (Section 12)
- **Commit**: `18cddc7`
- **PRD Coverage**: Section 12 (Success Metrics: Conversion Rate, Handoff Count, Abandoned Payments, Rate Staleness)
- **Work Executed**:
  - Built `src/app/api/staff/metrics/route.ts` executing database queries for the 4 metrics:
    1. Search-to-payment conversion rate: `Booking` count / `AvailabilitySearchEvent` count.
    2. Count of handed-off questions: `Handoff` count grouped by reason.
    3. Count of abandoned payments: `Payment` rows where status is `not_paid` or `unclear_pending_review`.
    4. Rate staleness: time elapsed since latest rate start date, with risk evaluation level (`Fresh`, `Attention Needed`, `Stale`).
  - Built Staff Dashboard (`/staff`) rendering live cards for all four metrics.
  - Built CLI runner `scripts/view-metrics.ts` for database metrics inspection from terminal.

---

## 4. Summary of TODO-DECISION Items
- **`prisma/seed.ts:156`**: PRD Section 14 Question 1 lists currency as an open question; defaulted to `USD` as the standard tariff currency for Zimbabwe wildlife safari lodges.
- **`src/lib/sms.ts:1`**: PRD Section 14 Question 3 lists SMS provider choice as an open question; stubbed single `sendSmsOtp` function logging to console for drop-in real provider (e.g. Twilio, Africa's Talking).

---

## 5. Verification & Testing Commands

### Automated Test Scripts
```bash
# 1. Guest Authentication & OTP Validation
npx tsx scripts/test-guest-auth.ts

# 2. Staff Authentication & Session Isolation
npx tsx scripts/test-staff-auth.ts

# 3. FR-4 Atomic Payment Decrement & Refusal Handoff
npx tsx scripts/test-payment-and-refusal.ts

# 4. PRD Section 12 Success Metrics
npx tsx scripts/view-metrics.ts
```

### Next.js Production Build
```bash
# Compiles all 42 static & dynamic routes with strict TypeScript and ESLint validation
npm run build
```

### Running the App Locally
```bash
# Start development server
npm run dev
```
- Guest App: `http://localhost:3000`
- Staff Admin Portal: `http://localhost:3000/staff/login` (Default demo credentials: `admin` / `admin123`)

---

## 6. Vercel Production Hardening & Remote Database Configuration

### Root Cause of Vercel Exception Digest
- **Prisma Engine Platform Mismatch**: Vercel serverless environments run on Linux (`rhel-openssl-3.0.x`). When Prisma Client is generated locally on Windows, the Linux query engine binary was missing.
- **Unreachable Localhost PostgreSQL in Cloud**: Local development relied on `@embedded-postgres` listening on `localhost:5432`. On Vercel, unhandled connection timeouts in server components resulted in unhandled 500 errors.
- **Missing App Router Error Boundary**: Without `error.tsx`, uncaught server-side exceptions bubble directly to Vercel's generic error page.

### Implemented Resolutions
1. **Multi-Platform Prisma Binaries**: Configured `binaryTargets = ["native", "rhel-openssl-3.0.x", "rhel-openssl-1.0.x", "debian-openssl-3.0.x"]` in `prisma/schema.prisma`.
2. **Postinstall Engine Generation**: Added `"postinstall": "prisma generate"` and `"build": "prisma generate && next build"` in `package.json`.
3. **App Error Boundaries**: Added `src/app/error.tsx` and `src/app/global-error.tsx` offering immediate recovery options and front-desk fallback contacts.
4. **Server Component Resilience**: Wrapped direct Prisma queries in `src/app/page.tsx`, `src/app/guest/rooms/page.tsx`, `src/app/guest/rooms/[id]/page.tsx`, `src/app/guest/hotel-info/page.tsx`, and `src/lib/refusal.ts` in defensive `try/catch` with fallback demo records and contacts if remote database is initializing.
5. **Remote Database Setup**:
   - Provide a managed PostgreSQL connection string (Neon, Supabase, Vercel Postgres, AWS RDS) via the `DATABASE_URL` environment variable in the Vercel dashboard.
   - Run `npm run db:push` to apply the schema and seed initial verified records into the remote PostgreSQL database.

---

## 7. Dynamic Wildlife Safari Backdrop System

### Implementation Details
- **Static Assets**: High-resolution bespoke African wildlife photography stored in `public/images/wildlife/`:
  - `elephants-river.jpg`: Breeding herd of African elephants wading across the Zambezi river at golden hour.
  - `leopard-savanna.jpg`: African savanna tree leopard resting on acacia branch at dawn.
  - `lion-sunset.jpg`: Male lion on granite kopje overlooking savanna at sunset.
- **Atmospheric Global Component (`src/components/WildlifeBackdrop.tsx`)**:
  - Mounted globally in `src/app/layout.tsx`.
  - Smooth cross-fade transition between scenes with slow subtle scale zoom (`transform: scale(1.04) -> scale(1)`).
  - Multi-stop vignette gradient overlay preserving maximum readability of all foreground text and cards.
  - Interactive ambient switcher pill in bottom right allowing guests to select their backdrop or let it cycle naturally.
- **Glassmorphic Surface Polish**:
  - Elevated `.card` elements with `backdrop-filter: blur(14px)` and `rgba(21, 28, 23, 0.88)` translucent background.
- **Homepage Wildlife Showcase (`src/app/page.tsx`)**:
  - Integrated "Front-Row Wildlife Encounters" section showcasing indigenous species and migratory patterns.


