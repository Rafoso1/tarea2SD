const express = require('express');
const fs = require('fs');
const JSONStream = require('JSONStream');
const readlineSync = require('readline-sync');

const app = express();
const port = 3003;
const baseUrl = 'http://localhost:3000';
let correo = "lyda.keebler63@ethereal.email";
const jsonFilePath = 'ecommerce_dataset.json';

app.use(express.json());

async function fetchPost1(product) {
    const fetch = (await import('node-fetch')).default;

    try {
        console.log('Enviando producto:', product);
        const response = await fetch(`${baseUrl}/solicitud`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "nombre": product.Nombre, "precio": product.Precio, "correo": correo }) // Reemplaza con los datos necesarios
        });
        const data = await response.json();
        console.log('POST Response:', data);
    } catch (error) {
        console.error('Error en POST:', error);
    }
}

async function fetchPost(products) {
    const fetch = (await import('node-fetch')).default;

    try {
        for (let product of products) {
            await fetchPost1(product);
        }
    } catch (error) {
        console.error('Error en POST:', error);
    }
}

function mail() {
    let choiceMail = readlineSync.question('\nIngrese un Mail, o ingrese Q para salir: ');
    while (!choiceMail.includes('@')) {
        if (choiceMail === 'Q') {
            console.log('Saliendo...');
            process.exit(0);
        } else {
            console.log('\nEl mail ingresado es invalido');
            choiceMail = readlineSync.question('\nIngrese un Mail: ');
        }
    }
    correo = choiceMail;
}

function showMenu() {
    console.log('\nMenú:');
    console.log('1. Realizar solicitud producto unico POST');
    console.log('2. Realizar solicitud producto multiple POST');
    console.log('3. Ingresar nuevo mail de confirmación');
    console.log('4. Salir');
    const choice = readlineSync.question('Seleccione una opcion: ');

    if (choice === '1') {
        let found = false;
        const stream = fs.createReadStream(jsonFilePath)
            .pipe(JSONStream.parse('*'))
            .on('data', product => {
                if (!found) {
                    fetchPost1(product);
                    found = true;
                }
            })
            .on('end', () => {
                if (!found) {
                    console.log('No se encontró ningún producto.');
                }
            });
    } else if (choice === '2') {
        const cantidad = readlineSync.question('Seleccione cantidad de productos (max 10 millones): ');
        let products = [];
        fs.createReadStream(jsonFilePath)
            .pipe(JSONStream.parse('*'))
            .on('data', product => {
                if (products.length < cantidad) {
                    products.push(product);
                } else {
                    fetchPost(products);
                    products = [];
                }
            })
            .on('end', () => {
                if (products.length > 0) {
                    fetchPost(products);
                }
            });
    } else if (choice === '3') {
        mail();
    } else if (choice === '4') {
        console.log('Saliendo...');
        process.exit(0);
    } else {
        console.log('Opción no válida. Intente de nuevo.');
    }
}

// Inicia el servidor Express
app.listen(port, () => {
  console.log(`Servidor API escuchando en http://localhost:${port}`);
  // Mostrar menú al iniciar
  setInterval(showMenu, 5000); // Cambia el intervalo según sea necesario
});
