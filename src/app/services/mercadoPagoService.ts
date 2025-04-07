// src/app/services/mercadoPagoService.ts
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  sandbox_mode: false, // Defina como false para produção
});

export default mercadopago;
