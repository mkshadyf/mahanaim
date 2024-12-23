import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.VITE_TWILIO_PHONE_NUMBER;

interface NotificationRecipient {
  phoneNumber: string;
  shopName: string;
}

export const sendSMSNotification = async (to: string, message: string) => {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_PHONE_NUMBER!,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export const sendReportReceivedNotification = async (shopName: string, recipientPhone: string) => {
  const message = `Rapport reçu pour ${shopName}. Merci pour votre ponctualité!`;
  await sendSMSNotification(recipientPhone, message);
};

export const sendMissingReportNotification = async (shopName: string, recipientPhone: string) => {
  const message = `RAPPEL: Le rapport journalier pour ${shopName} n'a pas encore été soumis. Veuillez le soumettre dès que possible.`;
  await sendSMSNotification(recipientPhone, message);
};

export const checkMissingReports = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all shops and their agents
    const shopsRef = collection(db, 'shops');
    const shopsSnapshot = await getDocs(shopsRef);

    const recipients: NotificationRecipient[] = [];

    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();

      // Get the agent assigned to this shop
      const usersRef = collection(db, 'users');
      const agentQuery = query(usersRef, where('shopId', '==', shopDoc.id));
      const agentSnapshot = await getDocs(agentQuery);

      if (!agentSnapshot.empty) {
        const agentData = agentSnapshot.docs[0].data();
        if (agentData.phoneNumber) {
          recipients.push({
            phoneNumber: agentData.phoneNumber,
            shopName: shopData.name,
          });
        }
      }
    }

    // Check for missing reports
    const reportsRef = collection(db, 'reports');
    const reportsQuery = query(reportsRef, where('date', '>=', today));
    const reportsSnapshot = await getDocs(reportsQuery);

    const submittedShopIds = new Set(reportsSnapshot.docs.map((doc) => doc.data().shopId));

    // Send notifications for missing reports
    for (const recipient of recipients) {
      if (!submittedShopIds.has(recipient.shopName)) {
        await sendMissingReportNotification(recipient.shopName, recipient.phoneNumber);
      }
    }
  } catch (error) {
    console.error('Error checking missing reports:', error);
    throw error;
  }
};
