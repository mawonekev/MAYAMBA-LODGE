import prisma from '../src/lib/prisma';
import {
  hashPassword,
  comparePassword,
  createOtpForGuest,
  verifyOtpForGuest,
  createGuestToken,
  verifyGuestToken,
} from '../src/lib/guest-auth';
import { sendSmsOtp } from '../src/lib/sms';

async function runTest() {
  console.log('Testing Guest Auth Flow...');

  const testPhone = '+263779998877';

  // Cleanup past test guest
  const existing = await prisma.guest.findUnique({ where: { phoneNumber: testPhone } });
  if (existing) {
    await prisma.otpCode.deleteMany({ where: { guestId: existing.id } });
    await prisma.guest.delete({ where: { id: existing.id } });
  }

  // 1. Password sign up
  const password = 'SecretPassword123!';
  const passwordHash = await hashPassword(password);
  const guest = await prisma.guest.create({
    data: {
      phoneNumber: testPhone,
      passwordHash,
    },
  });
  console.log('1. Created guest:', guest.id, guest.phoneNumber);

  // 2. Password check
  const passwordMatch = await comparePassword(password, guest.passwordHash);
  if (!passwordMatch) throw new Error('Password mismatch!');
  console.log('2. Password verification passed.');

  // 3. OTP generation
  const { code, expiresAt, id: otpId } = await createOtpForGuest(guest.id);
  console.log('3. Generated OTP:', code, 'expiresAt:', expiresAt);
  await sendSmsOtp(testPhone, code);

  // 4. Verify OTP
  const verifyResult = await verifyOtpForGuest(guest.id, code);
  if (!verifyResult.valid) throw new Error(`OTP verification failed: ${verifyResult.reason}`);
  console.log('4. OTP successfully verified.');

  // 5. Check used flag
  const otpRow = await prisma.otpCode.findUnique({ where: { id: otpId } });
  if (!otpRow?.used) throw new Error('OTP used flag was not set to true!');
  console.log('5. OTP marked used:', otpRow.used);

  // 6. Reuse should fail
  const reuseResult = await verifyOtpForGuest(guest.id, code);
  if (reuseResult.valid) throw new Error('Reusing OTP should have failed!');
  console.log('6. OTP reuse successfully rejected:', reuseResult.reason);

  // 7. Expired OTP test
  const expiredOtp = await prisma.otpCode.create({
    data: {
      guestId: guest.id,
      code: '123456',
      expiresAt: new Date(Date.now() - 1000 * 60), // 1 minute in the past
      used: false,
    },
  });
  const expiredResult = await verifyOtpForGuest(guest.id, '123456');
  if (expiredResult.valid) throw new Error('Expired OTP should have failed!');
  console.log('7. Expired OTP successfully rejected:', expiredResult.reason);

  // 8. Token test
  const token = await createGuestToken({ guestId: guest.id, phoneNumber: guest.phoneNumber, type: 'guest' });
  const verifiedToken = await verifyGuestToken(token);
  if (!verifiedToken || verifiedToken.guestId !== guest.id) throw new Error('Token verification failed!');
  console.log('8. JWT Guest session token verified:', verifiedToken.phoneNumber);

  console.log('All Guest Auth tests PASSED successfully!');
}

runTest()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
