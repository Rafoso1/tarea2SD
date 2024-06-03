const kafka = require('kafka-node');
const nodemailer = require('nodemailer');
const { promisify } = require('util');

const wait = promisify(setTimeout);

const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });

client.on('ready', () => {
  console.log('Kafka Client is connected and ready.');
});

client.on('error', (error) => {
  console.error('Kafka Client error:', error);
});

const consumerOptions = {
  kafkaHost: 'kafka:9092',
  groupId: 'notificacion-group',
  protocol: ['roundrobin'],
  fromOffset: 'latest'
};

async function initKafkaConsumer() {
  await wait(5000); // Add a delay to ensure Kafka topics are available

  const topics = ['procesamiento-topic'];
  const consumerGroup = new kafka.ConsumerGroup(consumerOptions, topics);

  consumerGroup.on('message', async function (message) {
    const messageValue = JSON.parse(message.value);
    console.log('Received message:', messageValue);

    try {
      let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'lyda.keebler63@ethereal.email',
          pass: 'HEtg56xsj21ek38Jcf'
        }
      });

      let info = await transporter.sendMail({
        from: '"Sender Name" <sender@example.com>',
        to: messageValue.correo,
        subject: 'Solicitud procesada',
        text: `Tu solicitud para ${messageValue.nombre} ha sido procesada.`
      });

      console.log('Correo enviado:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });

  consumerGroup.on('error', function (err) {
    console.error('Error in Kafka ConsumerGroup:', err);
  });

  consumerGroup.on('rebalancing', function (err) {
    console.log('Consumer rebalancing:', err);
  });

  consumerGroup.on('rebalanced', function (err) {
    console.log('Consumer rebalanced:', err);
  });

  consumerGroup.on('registered', function (err) {
    console.log('Consumer registered:', err);
  });

  consumerGroup.on('ready', function (err) {
    console.log('Consumer ready:', err);
  });
}

client.on('ready', () => {
  console.log('Kafka Client is connected and ready.');
  initKafkaConsumer();
});

client.on('error', (error) => {
  console.error('Kafka client error:', error);
});

const producer = new kafka.Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (error) => {
  console.error('Kafka producer error:', error);
});

const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

let solicitudData = {}; // In-memory store for solicitud data

app.post('/solicitud', (req, res) => {
  const solicitud = req.body;
  solicitud.id = require('uuid').v4();
  solicitud.estado = 'recibido';
  solicitudData[solicitud.id] = solicitud;
  res.json({ message: 'Solicitud recibida', id: solicitud.id });
});

app.get('/solicitud/:id', (req, res) => {
  const solicitud = solicitudData[req.params.id];
  if (solicitud) {
    res.json(solicitud);
  } else {
    res.status(404).send('Solicitud no encontrada');
  }
});

app.listen(PORT, () => {
    console.log(`Notificacion service is running on port ${PORT}`);
});
