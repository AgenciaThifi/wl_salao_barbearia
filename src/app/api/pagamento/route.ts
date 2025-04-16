// src/app/api/pagamento/route.ts
import { NextResponse } from "next/server";
import mercadopago from "@/app/services/mercadoPagoService";
import { PAYMENT_REDIRECT_URLS } from "./paymentUrls";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const preference = {
      items,
      back_urls: PAYMENT_REDIRECT_URLS,
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
