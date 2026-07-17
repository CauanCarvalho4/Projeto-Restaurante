// netlify/functions/enviar-pedido.js
const https = require("https");

function chamarCallMeBot(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let dados = "";
        res.on("data", (chunk) => (dados += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(dados);
          } else {
            reject(new Error(`CallMeBot retornou status ${res.statusCode}: ${dados}`));
          }
        });
      })
      .on("error", (erro) => reject(erro));
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { itens, subtotal, endereco, pagamento } = JSON.parse(event.body);

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ sucesso: false, erro: "Carrinho vazio" }),
      };
    }

    let msg = "🍔 NOVO PEDIDO - Brasas Burger\n\n";
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
    msg += `\nSubtotal: ${subtotalFormatado}\n\n`;
    msg += `Endereço: ${endereco || "não informado"}\n`;
    msg += `Pagamento: ${pagamento || "não informado"}`;

    const TELEFONE = process.env.CALLMEBOT_PHONE;
    const APIKEY = process.env.CALLMEBOT_APIKEY;

    if (!TELEFONE || !APIKEY) {
      console.error("Variáveis de ambiente não configuradas:", {
        temTelefone: !!TELEFONE,
        temApiKey: !!APIKEY,
      });
      return {
        statusCode: 500,
        body: JSON.stringify({
          sucesso: false,
          erro: "Configuração do servidor incompleta",
        }),
      };
    }

    const url = `https://api.callmebot.com/whatsapp.php?phone=${TELEFONE}&text=${encodeURIComponent(
      msg,
    )}&apikey=${APIKEY}`;

    const respostaCallMeBot = await chamarCallMeBot(url);
    console.log("Resposta CallMeBot:", respostaCallMeBot);

    return {
      statusCode: 200,
      body: JSON.stringify({ sucesso: true }),
    };
  } catch (erro) {
    console.error("Erro ao enviar pedido:", erro.message, erro.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ sucesso: false, erro: "Falha ao enviar pedido" }),
    };
  }
};
