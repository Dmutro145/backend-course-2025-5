const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const superagent = require('superagent');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу')
  .parse(process.argv);

const options = program.opts();

function getCacheFilePath(statusCode) {
  return path.join(options.cache, `${statusCode}.jpg`);
}

async function handleRequest(req, res) {
  const statusCode = req.url.slice(1);
  
  if (!/^\d+$/.test(statusCode)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid status code');
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetRequest(statusCode, res);
        break;
      case 'PUT':
        await handlePutRequest(statusCode, req, res);
        break;
      case 'DELETE':
        await handleDeleteRequest(statusCode, res);
        break;
      default:
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
}

// GET - отримати картинку з кешу або з http.cat
async function handleGetRequest(statusCode, res) {
  try {
    // Спершу пробуємо отримати з кешу
    const imageData = await fs.readFile(getCacheFilePath(statusCode));
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(imageData);
    console.log(`GET ${statusCode} - from cache`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Якщо файлу немає в кеші, робимо запит до http.cat
      await fetchFromHttpCat(statusCode, res);
    } else {
      throw error;
    }
  }
}

// Функція для отримання картинки з http.cat
async function fetchFromHttpCat(statusCode, res) {
  try {
    console.log(`GET ${statusCode} - fetching from http.cat`);
    
    const response = await superagent
      .get(`https://http.cat/${statusCode}`)
      .responseType('buffer')
      .timeout(10000); // 10 секунд таймаут

    // Зберігаємо картинку в кеш
    await fs.writeFile(getCacheFilePath(statusCode), response.body);
    
    // Відправляємо клієнту
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(response.body);
    
    console.log(`GET ${statusCode} - saved to cache and sent to client`);
    
  } catch (error) {
    console.error(`Error fetching from http.cat for status ${statusCode}:`, error.message);
    
    // Якщо запит до http.cat невдалий
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

// PUT - записати картинку в кеш
async function handlePutRequest(statusCode, req, res) {
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    try {
      const imageData = Buffer.concat(chunks);
      await fs.writeFile(getCacheFilePath(statusCode), imageData);
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end('Created');
      console.log(`PUT ${statusCode} - cached`);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
}

// DELETE - видалити картинку з кешу
async function handleDeleteRequest(statusCode, res) {
  try {
    await fs.unlink(getCacheFilePath(statusCode));
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    console.log(`DELETE ${statusCode} - deleted`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      throw error;
    }
  }
}

// Ініціалізація сервера
async function initializeServer() {
  try {
    await fs.mkdir(options.cache, { recursive: true });
    console.log(`Директорія кешу створена: ${options.cache}`);

    const server = http.createServer(handleRequest);
    
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



