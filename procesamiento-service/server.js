const kafka = require('kafka-node');
const express = require('express');
const bodyParser = require('body-parser');
const { promisify } = require('util');

const app = express();
app.use(bodyParser.json());

const Producer = kafka.Producer;
const ConsumerGroup = kafka.ConsumerGroup;
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });

const producer = new Producer(client);

producer.on('ready', function () {
    console.log('Kafka Producer is connected and ready.');
});

producer.on('error', function (err) {
    console.log('Error in Kafka Producer:', err);
});

const consumerOptions = {
    kafkaHost: 'kafka:9092',
    groupId: 'procesamiento-group',
    autoCommit: true,
    fromOffset: 'latest'
};

const consumerGroup = new ConsumerGroup(consumerOptions, 'solicitudes-topic');

consumerGroup.on('message', async function (message) {
    console.log('Received message:', message.value);
    const data = JSON.parse(message.value);
    data.estado = 'recibido';

    console.log('Message with updated estado:', JSON.stringify(data, null, 2)); // Mostrar el JSON actualizado en los logs

    producer.send([{ topic: 'procesamiento-topic', messages: JSON.stringify(data) }], (err, data) => {
        if (err) {
            console.log('Error sending message:', err);
        } else {
            console.log('Message sent:', data);
        }
    });

    // Esperar N segundos antes de cambiar el estado a "finalizado"
    const wait = promisify(setTimeout);
    await wait(10000); // Reemplazar 10000 con el tiempo N deseado en milisegundos

    data.estado = 'finalizado';
    producer.send([{ topic: 'procesamiento-topic', messages: JSON.stringify(data) }], (err, data) => {
        if (err) {
            console.log('Error sending message:', err);
        } else {
            console.log('Message sent:', data);
        }
    });
});

consumerGroup.on('error', function (err) {
    console.log('Error in Kafka ConsumerGroup:', err);
});

app.listen(3001, () => {
    console.log('Procesamiento service is running on port 3001');
});
