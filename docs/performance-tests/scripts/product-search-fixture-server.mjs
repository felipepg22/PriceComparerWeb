import { createServer } from "node:http";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.FIXTURE_PORT || "18080", 10);
const baseUrl = `http://${host}:${port}`;

const products = [
  ["iphone-15-128gb-a", "iPhone 15 128GB comprar", "4.799,00"],
  ["iphone-15-128gb-b", "iPhone 15 128GB loja", "4.999,00"],
  ["iphone-15-128gb-c", "iPhone 15 128GB oferta", "5.199,00"],
];

const server = createServer((request, response) => {
  const url = new URL(request.url, baseUrl);
  if (request.method === "GET" && url.pathname === "/search") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(`${JSON.stringify({
      results: products.map(([path, title]) => ({
        url: `${baseUrl}/product/${path}`,
        title,
        content: "iPhone 15 128GB comprar preco loja oficial",
      })),
    })}\n`);
    return;
  }

  const product = products.find(([path]) => url.pathname === `/product/${path}`);
  if (request.method === "GET" && product) {
    const [, title, price] = product;
    const escapedTitle = title.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html><head><title>${escapedTitle}</title><script type="application/ld+json">{"@type":"Product","name":"${escapedTitle}","offers":{"@type":"Offer","price":"${price}","priceCurrency":"BRL"}}</script></head><body><h1>${escapedTitle}</h1></body></html>`);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found\n");
});

server.listen(port, host, () => {
  process.stdout.write(`Product-search fixture listening on ${baseUrl}\n`);
});

function close() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", close);
process.on("SIGTERM", close);
