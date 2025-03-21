import axios from "axios";

const CALENDAR_ID = "exemple";
const API_KEY = "exemple";
const ACCESS_TOKEN = "exemple"
export const addEventToGoogleCalendar = async (date, time, clientName) => {
  try {
    const event = {
      summary: `Agendamento: ${clientName}`,
      description: `Agendamento feito por ${clientName} no salão.`,
      start: {
        dateTime: `${date}T${time}:00`,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: `${date}T${parseInt(time.split(":")[0]) + 1}:${time.split(":")[1]}:00`,
        timeZone: "America/Sao_Paulo",
      },
    };

    const response = await axios.post(
      `exemple${CALENDAR_ID}/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar evento no Google Calendar:", error);
    return null;
  }
};
