const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу')
  .parse(process.argv);

const options = program.opts();

async function initializeServer() {
  try {
    await fs.mkdir(options.cache, { recursive: true });
    console.log(`Директорія кешу створена: ${options.cache}`);

    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Проксі-сервер працює!');
    });
    
    server.listen(options.port, options.host, () => {
      console.log(`Проксі-сервер запущено на http://${options.host}:${options.port}`);
      console.log(`Директорія кешу: ${options.cache}`);
    });

  } catch (error) {
    console.error('Помилка ініціалізації сервера:', error);
    process.exit(1);
  }
}

initializeServer();

initializeServer();

