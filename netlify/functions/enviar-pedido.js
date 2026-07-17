// netlify/functions/enviar-pedido.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { itens, subtotal, endereco, pagamento } = JSON.parse(event.body);

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ erro: "Carrinho vazio" }) };
    }

    // Monta o texto no backend — o cliente NUNCA tem acesso a isso
    let msg = "🍔 *NOVO PEDIDO - Brasas Burger*\n\n";
    itens.forEach((item) => {
      const totalItem = (item.preco * item.qtd).toLocaleString("pt-BR", {