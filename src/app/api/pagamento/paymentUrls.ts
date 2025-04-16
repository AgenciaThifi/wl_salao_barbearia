// src/app/config/paymentUrls.ts
export const PAYMENT_REDIRECT_URLS = {
    success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
    failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/falha`,
    pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/pendente`,
  };
  