import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends a WhatsApp notification to the patient.
 * If TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are provided in .env, it dispatches a real WhatsApp message.
 * Otherwise, it logs a formatted simulation to the server's console.
 * 
 * @param {string} patientName 
 * @param {string} mobileNumber 
 * @param {string} date 
 * @param {string} time 
 * @param {string} reason 
 * @returns {Promise<{success: boolean, simulated: boolean, sid?: string, error?: string}>}
 */
export async function sendWhatsAppNotification(patientName, mobileNumber, date, time, reason) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || '+14155238886'; // Default Twilio Sandbox number

  // Standardize mobile number format (ensure country code exists)
  let formattedMobile = mobileNumber.trim();
  if (!formattedMobile.startsWith('+')) {
    // If it starts with a 10-digit standard Indian format, prepend +91
    if (formattedMobile.length === 10) {
      formattedMobile = `+91${formattedMobile}`;
    } else {
      formattedMobile = `+${formattedMobile}`;
    }
  }

  const messageBody = `Hello ${patientName}, your dental appointment with Dr. Arjun Sharma is scheduled for ${date} at ${time}. Reason: ${reason}. Thank you for choosing Dental ERP Clinic!`;

  console.log('\n--- 📱 WHATSAPP NOTIFICATION TRIGGERED ---');
  console.log(`To: ${formattedMobile}`);
  console.log(`Message: "${messageBody}"`);

  if (sid && token) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      
      const params = new URLSearchParams();
      params.append('From', `whatsapp:${from}`);
      params.append('To', `whatsapp:${formattedMobile}`);
      params.append('Body', messageBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`Status: Sent successfully via Twilio (Message SID: ${data.sid})`);
        console.log('-------------------------------------------\n');
        return { success: true, simulated: false, sid: data.sid };
      } else {
        console.error(`Twilio Error Code: ${data.code} | Message: ${data.message}`);
        console.log('-------------------------------------------\n');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message via Twilio:', error);
      console.log('-------------------------------------------\n');
      return { success: false, error: error.message };
    }
  } else {
    console.log('Status: Simulated (Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN in server/.env to send real messages)');
    console.log('-------------------------------------------\n');
    return { success: true, simulated: true };
  }
}
