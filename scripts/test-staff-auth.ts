import prisma from '../src/lib/prisma';
import {
  verifyStaffCredentials,
  createStaffToken,
  verifyStaffToken,
} from '../src/lib/staff-auth';
import {
  createGuestToken,
  verifyGuestToken,
} from '../src/lib/guest-auth';

async function runTest() {
  console.log('Testing Staff Auth Isolation...');

  // 1. Check default seeded admin credentials
  const staff = await verifyStaffCredentials('admin', 'admin123');
  if (!staff) throw new Error('Seeded staff admin credentials failed verification!');
  console.log('1. Staff admin credentials verified successfully:', staff.username, staff.role);

  // 2. Wrong password should fail
  const wrongPass = await verifyStaffCredentials('admin', 'wrongpass');
  if (wrongPass) throw new Error('Wrong password should not verify!');
  console.log('2. Wrong password correctly rejected.');

  // 3. Create Staff Token
  const staffToken = await createStaffToken({
    staffId: staff.id,
    username: staff.username,
    role: staff.role,
    type: 'staff',
  });
  const verifiedStaff = await verifyStaffToken(staffToken);
  if (!verifiedStaff || verifiedStaff.staffId !== staff.id) throw new Error('Staff token verification failed!');
  console.log('3. Staff token minted and verified:', verifiedStaff.username, verifiedStaff.role);

  // 4. Isolation Test: Guest token cannot pass as Staff
  const fakeGuestToken = await createGuestToken({
    guestId: 'dummy_guest_id',
    phoneNumber: '+263771112233',
    type: 'guest',
  });
  const guestPassingAsStaff = await verifyStaffToken(fakeGuestToken);
  if (guestPassingAsStaff) {
    throw new Error('SECURITY BREACH: Guest token was accepted as staff token!');
  }
  console.log('4. Security verification passed: Guest token strictly rejected by staff auth validator.');

  // 5. Isolation Test: Staff token cannot pass as Guest
  const staffPassingAsGuest = await verifyGuestToken(staffToken);
  if (staffPassingAsGuest) {
    throw new Error('SECURITY BREACH: Staff token was accepted as guest token!');
  }
  console.log('5. Security verification passed: Staff token strictly rejected by guest auth validator.');

  console.log('All Staff Auth & Security Isolation tests PASSED!');
}

runTest()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
