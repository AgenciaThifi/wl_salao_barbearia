import axios from "axios";

const CALENDAR_ID = "59f41da4ab32c7e6d8b4f21fda0be22f17ef0466eb7d6e85ac595600d6098e39@group.calendar.google.com";
const API_KEY = "AIzaSyB-u-UUzyxalqu9MJBy_AvlnO7UjxxdAio";
const ACCESS_TOKEN = "ya29.c.c0ASRK0GZarPPVc0g7tC8AUVcsH-rHXE3JJSjo0rrvaEPtHLEOIfugPESm5pBzyUISVQM5q1Bihhu21yncdXh4Xi439rWlTYpEMSX8w-7XYkqR3YP-L4x0QqZUbQZnqNTAdc3sUtHskFfEKYhJDTqX1zxx5RYJVZG_mUVGIX9OJwtzkO8H8DdLhMia9it9BwNOGRZljxbQm03lHoYpITycuEnHxL4tM637MBikxoXUvApIT1dgJei6kxhamNHi1cwcFyBMKB16FcoZEL7aLgh8fDq0oT6PC69oxnJk2guWBUE4TfTWUVLL_igT9ZtfTQKfnEjJDwVEwR09-Bs3UV9ly-blzGLckNcnpx0MxW-WIqw5YH1nQeMXVfGgL385PZ2nYrazxOrq2q1-ymXhfbnJR3Fzn8mSasJBrwZ3F_rXSp-7yQh6JZ14xrOwWpxVpU9m14O_Sm1yerQn8OpF9_SwsiIwivWXJ4735Zlsl8aleXgaz0_IYb865e2i8mfQ5zcWcsiW9rQglks7_q69V-UdJi2WZ8e2waguhVmnQf5XyuXdQ8xeR4Bm1ae_1wu7ri-YZ910pjzF-bX43ak9F-eg6MUI6xUWFxpSOnnVvyQarcbv-6488qufZS7_eM3-fnUv4yXsxBXgaSjY886XMbIgV3wtZVfvtXznkmw79sOkMXi3-Y8ed9_zVeJRI3WUq6-9qBl9vMpab2ltiJ7yf1RMtXj9cX_92Wy58MuakqMus4XUQs2h0enga9oXfbz110zh6glXcQ68aj39wvsXFjF-gss9uuJfsMfb-l6cvUcQ1gsf3j33bag5UcUXMj5n0w1FQrIIp-ItSkUuxZWtaw_5I3-zQS31Zejeqi5kXxjF8Q0gRSmmzS0a75ereFa7UYmyvpwMRemcV44tpb3Fi_ht4bI4Qw213cyat2Byea46shbsnwumcJBudfcIsjs_0Y--gpigfamgoo2d6s6cIrmv52Xl35Zpyiey_ZIlrIqj46qx8h_15Spe586";

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
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
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
