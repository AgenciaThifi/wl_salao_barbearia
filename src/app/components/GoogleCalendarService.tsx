export const addEventToGoogleCalendar = async (date: string, time: string, clientName: string) => {
  try {
    const response = await fetch("/api/google-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, clientName }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    console.log("Evento criado com sucesso:", data.event);
    return data.event;
  } catch (error) {
    console.error("Erro ao adicionar evento no Google Calendar:", error);
    return null;
  }
};
