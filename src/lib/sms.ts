// TODO-DECISION: PRD Section 14 Question 3 lists SMS provider choice as an open question; stubbed single sendSmsOtp function logging to console for drop-in real provider.
export async function sendSmsOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId: string }> {
  const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  // Real provider integration (Twilio, Africa's Talking, Infobip, etc.) can be dropped in here
  console.log(`\n==================================================`);
  console.log(`[SMS PROVIDER STUB - Mayamba Lodge]`);
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: Your Mayamba Lodge verification code is: ${code}. It expires in 10 minutes.`);
  console.log(`Message ID: ${messageId}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    messageId,
  };
}
