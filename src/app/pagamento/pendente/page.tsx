export default function Pendente() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-6">
      <h1 className="text-3xl font-bold text-yellow-600 mb-2">⌛ Pagamento pendente</h1>
      <p className="text-gray-700 mb-6">
        Estamos processando seu pagamento. Você receberá um e-mail assim que for confirmado.
      </p>
      <a
        href="/store"
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
      >
        Voltar para a loja
      </a>
    </div>
  );
}
