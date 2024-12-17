const express = require('express');
const venom = require('venom-bot');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o middleware CORS

const puppeteer = require('puppeteer-core');

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://127.0.0.1:55676', // Substitua pela URL permitida
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
};

app.use(corsOptions);

let client;


async function initializePuppeteer() {
  const puppeteerFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await puppeteerFetcher.download('884014'); // Revisão específica do navegador Chrome
  const browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
    args: ['--no-sandbox', '--disabled-setupid-sandbox']
  });
  return browser;
}

async function test() {
  try {
    const browser = await initializePuppeteer();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1280,
      deviceScaleFactor: 1,
    });

    // Go to page
    await page.goto('https://google.com/', {
      waitUntil: 'networkidle0',
    });
  } catch (error) {
    console.error('Erro ao inicializar o Puppeteer:', error);
  }
}

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Opcional para registrar o QR na terminal
    },
    undefined,
    { logQR: false, headless: 'new' } // Adiciona `headless: 'new'`
  )
  .then((clientInstance) => {
    client = clientInstance;
    console.log('Bot iniciado');
  })
  .catch((erro) => {
    console.error('Erro ao iniciar o Venom:', erro);
  });

app.post('/send-message', (req, res) => {
  const { number, message } = req.body;

  if (!client) {
    return res.status(500).json({ success: false, error: 'Bot not initialized' });
  }

  client.sendText(number, message)
    .then(result => res.json({ success: true, result }))
    .catch(erro => {
      console.error('Erro ao enviar mensagem:', erro);
      res.status(500).json({ success: false, error: erro.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
