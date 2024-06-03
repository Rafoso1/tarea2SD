const express = require('express');
const { KafkaClient, Producer } = require('kafka-node');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const client = new KafkaClient({ kafkaHost: 'kafka:9092' });
const producer = new Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (error) => {
  console.error('Error in Kafka Producer:', error);
});

const solicitudes = {}; // Almacén en memoria para las solicitudes

function getRandomId(max) {
  return Math.floor(Math.random() * max);
}

app.post('/solicitud', (req, res) => {
  const solicitud = req.body;
  solicitud.id = getRandomId(10000000); // Agregar un id único a la solicitud

  solicitudes[solicitud.id] = solicitud; // Almacenar la solicitud en memoria

  console.log('Solicitud recibida:', solicitud); // Mostrar el JSON recibido en los logs

  const payloads = [
    {
      topic: 'solicitudes-topic',
      messages: JSON.stringify(solicitud),
      partition: 0
    }
  ];

  producer.send(payloads, (error, data) => {
    if (error) {
      console.error('Error al enviar el mensaje a Kafka:', error); // Mostrar error en los logs si ocurre
      res.status(500).send(error);
    } else {
      console.log('Mensaje enviado a Kafka:', data); // Mostrar confirmación de envío en los logs
      res.status(200).send({ id: solicitud.id, ...data });
    }
  });
});

app.get('/solicitud/:id', (req, res) => {
  const id = req.params.id;
  const solicitud = solicitudes[id];

  if (solicitud) {
    res.status(200).send(solicitud);
  } else {
    res.status(404).send('Solicitud no encontrada');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Solicitud service is running on port ${PORT}`);
});
