const express = require('express');
const venom = require('venom-bot');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o middleware CORS

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Adicionando o middleware CORS para permitir requisições de diferentes origens

let client;

// Configuração do Venom sem Puppeteer
venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Opcional para registrar o QR na terminal
    },
    undefined,
    { logQR: false, headless: 'new' } // Adicione `headless: 'new'` conforme a recomendação
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
