// src/app/api/pagamento/route.ts
import { NextResponse } from "next/server";
import mercadopago from "@/app/services/mercadoPagoService";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const preference = {
      items,
      back_urls: {
        success: "http://localhost:3004/sucesso",
        failure: "http://localhost:3004/falha",
        pending: "http://localhost:3004/pendente",
      },
      auto_return: "approved",
    };

    const response = await new Promise<any>((resolve, reject) => {
      mercadopago.preferences.create(preference, (err: any, data: any) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    return NextResponse.json({ init_point: response.body.init_point });
  } catch (error: any) {
    console.error("Erro ao criar preferência:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
