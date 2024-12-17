const express = require('express');
const venom = require('venom-bot');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o middleware CORS
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Adicionando o middleware CORS para permitir requisições de diferentes origens

let client;

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Opcional para registrar o QR na terminal
    },
    undefined,
    { logQR: false }
  )
  .then((clientInstance) => {
    client = clientInstance;
    console.log('Bot iniciado');
  })
  .catch((erro) => {
    console.error('Erro ao iniciar o Venom:', erro);
  });

// Configuração do Puppeteer para encontrar o navegador
const initializePuppeteer = async () => {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await puppeteer.executablePath();
  puppeteer.executablePath = executablePath;
};

initializePuppeteer();

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
