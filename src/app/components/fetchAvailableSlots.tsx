export async function fetchAvailableSlots(token: string, setAvailableSlots: Function) {
  try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me/calendar/events", {
          headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      const busySlots = data.value.map((event: any) => ({
          start: new Date(event.start.dateTime).toISOString(),
          end: new Date(event.end.dateTime).toISOString(),
      }));

      const availableSlots = [];
      let startTime = new Date();
      startTime.setHours(8, 0, 0, 0);
      let endTime = new Date(startTime);
      endTime.setHours(18, 0, 0, 0);

      while (startTime < endTime) {
          let nextSlot = new Date(startTime);
          nextSlot.setHours(startTime.getHours() + 1);

          if (!busySlots.some(slot => new Date(slot.start) < nextSlot && new Date(slot.end) > startTime)) {
              availableSlots.push({ start: startTime.toISOString(), end: nextSlot.toISOString() });
          }

          startTime = nextSlot;
      }

      setAvailableSlots(availableSlots);
  } catch (error) {
      console.error("Erro ao buscar eventos:", error);
  }
}
