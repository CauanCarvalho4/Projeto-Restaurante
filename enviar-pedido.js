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
        style: "currency",
        currency: "BRL",
      });
      msg += `• ${item.qtd}x ${item.titulo} — ${totalItem}\n`;
    });
    const subtotalFormatado = Number(subtotal).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    msg += `\n*Subtotal: ${subtotalFormatado}*\n\n`;
    msg += `📍 Endereço: ${endereco || "não informado"}\n`;
    msg += `💳 Pagamento: ${pagamento || "não informado"}`;

    // Variáveis de ambiente configuradas no painel da Netlify (Site settings > Environment variables)
    const TELEFONE = process.env.CALLMEBOT_PHONE;
    const APIKEY = process.env.CALLMEBOT_APIKEY;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${TELEFONE}&text=${encodeURIComponent(
      msg,
    )}&apikey=${APIKEY}`;

    const resposta = await fetch(url);
    const texto = await resposta.text();

    if (!resposta.ok) {
      throw new Error(`CallMeBot retornou erro: ${texto}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ sucesso: true }),
    };
  } catch (erro) {
    console.error("Erro ao enviar pedido:", erro);
    return {
      statusCode: 500,
      body: JSON.stringify({ sucesso: false, erro: "Falha ao enviar pedido" }),
    };
  }
};
