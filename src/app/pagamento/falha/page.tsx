export default function Falha() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-2">❌ Pagamento falhou</h1>
      <p className="text-gray-700 mb-6">
        Houve um problema com o seu pagamento. Tente novamente ou utilize outro método.
      </p>
      <a
        href="/store"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
      >
        Voltar para a loja
      </a>
    </div>
  );
}
