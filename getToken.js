

const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: "D:/salao/wl_salao_barbearia/chave.json",
 // Caminho para o arquivo JSON da conta de serviço
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  console.log("Access Token:", tokenResponse.token);
}

getAccessToken();
