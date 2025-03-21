import axios from "axios";

const TWILIO_ACCOUNT_SID = "SEU_TWILIO_ACCOUNT_SID";
const TWILIO_AUTH_TOKEN = "SEU_TWILIO_AUTH_TOKEN";
const TWILIO_PHONE_NUMBER = "SEU_NUMERO_TWILIO";
const ADMIN_PHONE_NUMBER = "NUMERO_DO_DONO";

export const sendWhatsAppMessage = async (clientName, clientPhone, date, time) => {
  try {
    const messageBody = `Agendamento confirmado! Cliente: ${clientName}, Data: ${date}, Hora: ${time}`;
    
    // Enviar mensagem para o administrador
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        Body: messageBody,
        From: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        To: `whatsapp:${ADMIN_PHONE_NUMBER}`,
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // Enviar mensagem para o cliente
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        Body: `Seu agendamento no salão foi confirmado para ${date} às ${time}. Esperamos você!`,
        From: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        To: `whatsapp:${clientPhone}`,
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  } catch (error) {
    console.error("Erro ao enviar mensagem no WhatsApp:", error);
  }
};