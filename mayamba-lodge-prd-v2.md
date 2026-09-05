# Mayamba Lodge App — Product Requirements Document (Revised)

## 1. Product Summary

Mayamba Lodge app is a guest facing application that lets a guest check real room availability, view rates and room types, view hotel information, pay for a reservation, and look up their own booking history. It reads only from Mayamba Lodge's own records. It never uses the open internet to answer a guest's question. Payment processing through Flutterwave is the only external network call the app makes. A separate staff admin panel is the only place shared records are created or changed.

Version one runs on dummy data, clearly marked as test data, to prove the concept before real bookings go live.

## 2. Problem

Today a guest calls Mayamba Lodge to ask about a room. The call sometimes goes unanswered because staff are occupied with a guest at the desk. When the call connects, staff are sometimes unsure of the current rate and must check with someone else, asking the guest to call back. In the time it takes to call back, the guest books elsewhere. The lodge loses a paying guest not because no room was available, but because nobody could confirm the price and take payment fast enough.

## 3. Goals

| Goal | What it means concretely |
|---|---|
| Give a guest a way to check availability, rate, and pay without calling the lodge | A guest can see availability and rate and pay, without calling anyone |
| Keep private guest data private | A guest can only see their own bookings, never another guest's |
| Never let the app guess | Any question the records cannot answer is handed to a person, not guessed at |
| Work on a low end phone with low data | The app must load and function on a basic Android phone using a small data bundle |
| Test demand before building a full booking ecosystem | Version one measures whether guests convert, not just whether they browse |

Note: this PRD does not claim version one reduces phone-based lost bookings. That claim needs a before-and-after measurement of phone call outcomes, which version one does not collect. See Open Questions.

## 4. Users and Personas

**Primary persona: Tendai, the planning guest.**
Mid-thirties, based in Harare. Owns a mid-range Android phone. Buys data in small bundles. Has unreliable power at home and charges his phone at work. Plans a handful of trips a year and wants quick answers: is a room free, what does it cost, what does the place look like, can he pay now to lock it in. Opens the app three to four times a year, mainly while actively planning a trip. Between trips he opens it only if prompted by a rate drop message or a need to check a past confirmation number.

**Secondary persona: lodge front desk staff.**
Responsible for loading availability, setting rates, uploading photos and information, reviewing guest sign ups, and checking flagged content issues. Not a user of the guest facing app. Uses the admin panel only.

**Tertiary persona: the reservations team.**
Receives handoffs from the app by WhatsApp number and reservations email whenever the app cannot or will not answer something. Not a user of the app itself, but a required destination it must always be able to reach.

ASSUMPTION: no owner persona distinct from staff is defined, because the idea uses "staff and owner screens" as one group with the same admin login. If the lodge wants owner-only visibility, for example into payment totals staff cannot see, that is a separate role to define later.

## 5. Scope

**In scope for version one:**
- Guest search of availability by calendar, on dummy data
- Guest view of rates, room types, room features
- Guest view of hotel information: fact sheet, check in and out times, outlet opening and closing times, photos
- Guest payment for a reservation through Flutterwave
- Guest sign up, sign in, and view of own booking history by confirmation number or date of stay
- Staff admin panel: load availability, set rates, upload content, manage guest sign ups, review flagged content, view payment status
- A guest facing way to flag incorrect content for staff review

**Out of scope for version one:**
- In-app chat with staff
- Automatic booking reminders or follow-up messages of any kind
- Linking a booking made by phone or in person into a guest's app account
- Automated handling of refunds or disputed payment amounts
- Any comparison of one guest's payment or booking against another guest's
- Deleting a guest account that has any existing booking

## 6. Functional Requirements

| ID | Feature | Guest asks | App answers | Reads / writes |
|---|---|---|---|---|
| FR-1 | Availability search | Is a room free on these dates? | List of available room types for that date range. Every search is logged, regardless of result | Reads Availability; writes AvailabilitySearchEvent |
| FR-2 | Rates and room details | What would it cost, what do I get? | Current rate and room details for a room type | Reads RoomType, Rate |
| FR-3 | Hotel information | What are check in times, opening hours, what does it look like? | Fact sheet, times, photos | Reads HotelInfo, Photo |
| FR-4 | Payment | Can I lock this in now? | Inside one database transaction: re-check that Availability.roomsOpen for that room and date is still greater than zero, decrement it by one, then create the Booking and Payment. If roomsOpen is already zero at that moment, the payment fails with a "room no longer available" result instead of charging the guest | Reads/writes Availability; writes Booking, Payment |
| FR-5 | Booking history | What did I book, is it still confirmed? | Booking status by confirmation number or date of stay, own bookings only | Reads Booking scoped to signed-in guest |
| FR-6 | Sign up / sign in | — | Creates or authenticates a guest account, using a password or a one time code sent by SMS | Writes Guest, OtpCode |
| FR-7 | Content flag | This information looks wrong | Confirmation the flag was sent to staff | Writes ContentFlag |
| FR-8 (staff) | Availability management | — | Staff sets which rooms are open on which dates | Writes Availability |
| FR-9 (staff) | Rate management | — | Staff sets and changes rates | Writes Rate |
| FR-10 (staff) | Content management | — | Staff uploads photos, fact sheet, times, WhatsApp number, and reservations email | Writes HotelInfo, Photo |
| FR-11 (staff) | Guest sign up review | — | Staff views registered guests | Reads Guest |
| FR-12 (staff) | Flag review | — | Staff reviews and resolves flagged content | Reads/writes ContentFlag |
| FR-13 (staff) | Payment status view | — | Staff views payment status per booking | Reads Booking, Payment |

**Refusal rules, apply across all guest facing features:**
- If a record needed to answer is missing, the app states plainly that the information is not yet available and shows the WhatsApp number and reservations email, read from the `HotelInfo` record. It never estimates or guesses.
- The app always refuses, regardless of whether a record exists, any question about a refund or disputed payment amount, and any question comparing one guest's payment or booking against another's. Both route to the reservations team, using the same `HotelInfo` contact fields.

## 7. AI and AI-Related Tools and Solutions

This product does not use AI to generate answers. Every guest facing answer comes directly from a database lookup against a specific record, never from a model that composes or infers a response. This is deliberate: the idea explicitly requires that when records hold no answer, the app says so and hands off to a person, rather than producing a plausible-sounding guess.

ASSUMPTION: no AI-generated content, recommendation, or chat feature is included anywhere in version one, because the idea's own rule states that if a normal chatbot with internet access could answer a feature, that feature is worthless, and because chat was explicitly cut in section 4 of the refined idea.

## 8. Technical Architecture

**Stack:** Next.js for both the guest facing app and the staff admin panel, as two separate route groups within one application. TypeScript throughout. Prisma as the ORM. PostgreSQL as the database.

ASSUMPTION: guest app and staff admin panel are built as one Next.js application with two separate authenticated route groups, rather than two separate applications, because this is simpler to build and deploy for free within the stated constraints.

**Authentication:** guests sign up and sign in with a phone number and password, or with a one time code sent by SMS. Each generated code is stored with an expiry time and a used flag, so a code cannot be reused or accepted once expired. Staff sign in separately with an admin login, kept in a distinct table from guest accounts so a guest account can never be granted admin access by mistake.

ASSUMPTION: phone number is used as the guest identifier rather than email, because the persona described buys data in small bundles and may check email far less reliably than receiving an SMS, which does not require data to receive. This has a small ongoing SMS cost that needs a provider decision, listed in Open Questions.

**Payments:** Flutterwave handles the payment flow. The app never stores card details directly. A webhook from Flutterwave updates the Booking and Payment records with the final status. Each webhook's Flutterwave reference is unique in the database, so a duplicate delivery of the same event is rejected rather than applied twice.

**Data deletion:** a guest account with any existing booking cannot be deleted in version one. This policy is a placeholder until a real data deletion process is defined.

**Data model (Prisma schema):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Guest {
  id           String    @id @default(cuid())
  phoneNumber  String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  bookings     Booking[]
  contentFlags ContentFlag[]
  otpCodes     OtpCode[]
}

model OtpCode {
  id        String   @id @default(cuid())
  guest     Guest    @relation(fields: [guestId], references: [id])
  guestId   String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Staff {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  role         String   // "staff" or "owner"
  createdAt    DateTime @default(now())
}

model RoomType {
  id           String   @id @default(cuid())
  name         String
  description  String
  features     String[]
  isTestData   Boolean  @default(true)
  photos       Photo[]
  rates        Rate[]
  availability Availability[]
  bookings     Booking[]
}

model Photo {
  id         String    @id @default(cuid())
  url        String
  caption    String?
  roomType   RoomType? @relation(fields: [roomTypeId], references: [id])
  roomTypeId String?
  isTestData Boolean   @default(true)
}

model Rate {
  id            String   @id @default(cuid())
  roomType      RoomType @relation(fields: [roomTypeId], references: [id])
  roomTypeId    String
  pricePerNight Decimal
  currency      String
  validFrom     DateTime
  validTo       DateTime
  isTestData    Boolean  @default(true)
}

model Availability {
  id         String   @id @default(cuid())
  roomType   RoomType @relation(fields: [roomTypeId], references: [id])
  roomTypeId String
  date       DateTime
  roomsOpen  Int
  isTestData Boolean  @default(true)

  @@unique([roomTypeId, date])
}

model HotelInfo {
  id               String   @id @default(cuid())
  factSheet        String
  checkInTime      String
  checkOutTime     String
  outletOpenTime   String
  outletCloseTime  String
  outletName       String
  whatsappNumber   String
  reservationsEmail String
  isTestData       Boolean  @default(true)
}

model Booking {
  id               String   @id @default(cuid())
  confirmationCode String   @unique
  guest            Guest    @relation(fields: [guestId], references: [id])
  guestId          String
  roomType         RoomType @relation(fields: [roomTypeId], references: [id])
  roomTypeId       String
  stayDateFrom     DateTime
  stayDateTo       DateTime
  status           String   // "confirmed", "cancelled", "no_show"
  payment          Payment?
  isTestData       Boolean  @default(true)
}

model Payment {
  id             String   @id @default(cuid())
  booking        Booking  @relation(fields: [bookingId], references: [id])
  bookingId      String   @unique
  amount         Decimal
  currency       String
  status         String   // "paid", "not_paid", "unclear_pending_review"
  flutterwaveRef String?  @unique
  createdAt      DateTime @default(now())
}

model ContentFlag {
  id          String   @id @default(cuid())
  guest       Guest    @relation(fields: [guestId], references: [id])
  guestId     String
  description String
  status      String   @default("open")
  createdAt   DateTime @default(now())
}

model SearchMiss {
  id        String   @id @default(cuid())
  dateFrom  DateTime
  dateTo    DateTime
  createdAt DateTime @default(now())
}

model AvailabilitySearchEvent {
  id        String   @id @default(cuid())
  dateFrom  DateTime
  dateTo    DateTime
  createdAt DateTime @default(now())
}
// Logs every availability search, successful or not, so the conversion metric in section 12 has a real denominator.

model Handoff {
  id        String   @id @default(cuid())
  reason    String   // "records_silent", "refund_or_dispute", "payment_unclear"
  guestId   String?
  createdAt DateTime @default(now())
}
```

## 9. Vector Database Architecture and Design

Not applicable to version one. Every guest facing answer in this product is an exact lookup against a specific record: an availability row for a date, a rate for a room type, a booking for a confirmation code. None of these require semantic search or similarity matching, which is what a vector database is for. A relational lookup in PostgreSQL answers all of them correctly and simply.

## 10. Vector Database Model

Not applicable, for the same reason as section 9. No model is defined.

## 11. Business Model

The app itself is free for a guest to download and use. Revenue comes from the stay itself, paid through Flutterwave inside the app. Flutterwave takes a percentage of each successful transaction; the exact current rate depends on the merchant account's registered country and currency, which is listed as an open question below since it was not given.

ASSUMPTION: there is no subscription, membership tier, or in-app purchase beyond paying for a stay, because nothing in the idea describes one.

## 12. Success Metrics

| Metric | What it measures | How it is computed | Why it matters here |
|---|---|---|---|
| Search-to-payment conversion rate | Of guests who searched availability, the percentage who went on to complete payment | Count of `Booking` rows divided by count of `AvailabilitySearchEvent` rows over the same period | Directly tests whether seeing the hotel represented in the app makes a guest want to book and pay |
| Count of handed-off questions | Number of times the app could not or would not answer and routed to the reservations team | Count of `Handoff` rows | Shows the gap between what guests need and what version one currently answers |
| Count of abandoned payments | Number of payments started but not completed | Count of `Payment` rows with status "not_paid" or "unclear_pending_review" | Flags whether the payment flow itself is losing guests |
| Rate staleness | Time since a rate or availability record was last updated by staff | Time since the most recent `Rate` or `Availability` row was created or changed | Surfaces risk 2 in section 13 before it becomes a guest-facing problem |

Open question: no target number or percentage is given for any of these metrics in the idea, so none is invented here. See Open Questions.

## 13. Risks

| Rank | Risk | Why it is ranked here |
|---|---|---|
| 1 | A payment is not honoured correctly: shown paid when it failed, shown unclear when it actually succeeded, or two guests both completing payment for the same last available room due to a timing gap at the moment of payment | Direct financial loss or a guest wrongly turned away; the most severe because it is a trust and money failure at once |
| 2 | Staff stop keeping availability and rates current, and the app confidently shows stale information | Nothing in the app itself detects this; only a guest complaint would, by which point trust is already damaged |
| 3 | Dummy test data is mistaken by a guest for a real, bookable room or price during the testing period | Contained to the testing window and avoidable by the isTestData marking in the data model, so lower severity than the first two |

## 14. Open Questions

1. Which currency are guests actually charged in through Flutterwave? This decides the exact transaction percentage and affects the Rate model's currency field.
2. Which Flutterwave account and country registration will the merchant account use? This must be confirmed before the payment integration can be built.
3. Phone number with SMS one-time code, or email, for guest sign up verification? This affects the sign-up flow and any ongoing SMS cost, and which SMS provider is used.
4. Who at the lodge is responsible for keeping availability and rates updated daily, and what happens if they do not?
5. What are the target numbers for the success metrics in section 12: what conversion rate, what handoff volume, would count as version one working?
6. When will bookings made by phone or in person be linked into a guest's app account, and what will that linking process look like in version two?
7. Who is responsible for renewing or upgrading any paid infrastructure, such as database hosting, if usage grows beyond a free tier?
8. How will the actual reduction in phone-based lost bookings be measured, since version one only measures in-app conversion, not phone call outcomes before and after launch?
9. What is the account deletion policy for a guest with existing bookings, since version one blocks deletion entirely as a placeholder?
