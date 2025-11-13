const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'tu-secreto-aqui-cambiar';

app.use(express.json());

app.post('/webhook', (req, res) => {
  // Verificar firma de GitHub
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  if (signature !== digest) {
    console.log('❌ Firma inválida');
    return res.status(401).send('Unauthorized');
  }

  // Solo desplegar en push a main
  if (req.body.ref === 'refs/heads/main') {
    console.log('✅ Push detectado en main, iniciando despliegue...');
    
    exec('bash /root/plataforma-lexalia/deploy.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error en despliegue:', error);
        return res.status(500).send('Deploy failed');
      }
      console.log('📋 Salida:', stdout);
      if (stderr) console.log('⚠️  Warnings:', stderr);
    });

    res.status(200).send('Deploy initiated');
  } else {
    res.status(200).send('No action needed');
  }
});

app.get('/health', (req, res) => {
  res.send('Webhook server running');
});

app.listen(PORT, () => {
  console.log(`🎣 Webhook server listening on port ${PORT}`);
});
