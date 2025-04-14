// src/app/api/send-email/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    // Extrai os dados enviados no corpo da requisição
    const { email, clientName, date, time, service, location } = await req.json();

    // Verifica se os campos necessários foram enviados
    if (!email || !clientName || !date || !time || !service || !location) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios não foram preenchidos." },
        { status: 400 }
      );
    }

    // Cria o transporter com as configurações do SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === "true", // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Opções de e-mail (mensagem)
    const mailOptions = {
      from: process.env.EMAIL_FROM, // remetente definido nas variáveis de ambiente
      to: email, // destinatário
      subject: "Confirmação de Agendamento",
      text: `
Olá ${clientName},

Seu agendamento para o serviço "${service}" foi confirmado para o dia ${date} às ${time}.

Local: ${location}

Obrigado pela preferência!
      `,
      // Você também pode enviar conteúdo em HTML:
      // html: `<p>Olá ${clientName},</p><p>Seu agendamento para o serviço <strong>${service}</strong> foi confirmado para o dia <strong>${date}</strong> às <strong>${time}</strong>.</p><p>Local: ${location}</p><p>Obrigado!</p>`
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no envio de e-mail:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}
