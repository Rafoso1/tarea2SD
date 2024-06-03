import express from 'express';
import fs from 'fs';
import JSONStream from 'JSONStream';
import readlineSync from 'readline-sync';
import fetch  from 'node-fetch';
const app = express();
const port = 3003;
const baseUrl = 'http://localhost:3000';
let correo = "lyda.keebler63@ethereal.email";
const jsonFilePath = 'ecommerce_dataset.json';

app.use(express.json());

function getRandomId(max) {
  return Math.floor(Math.random() * max);
}

async function fetchPost1(product) {
    try {
        console.log('Enviando producto:', product);
        const response = await fetch(`${baseUrl}/solicitud`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"nombre": product.Nombre, "precio": product.Precio, "correo": correo}) // Reemplaza con los datos necesarios
        });
        console.log('Enviado: ', response);
    } catch (error) {
        console.error('Error en POST:', error);
    }
    showMenu();
}

async function fetchPost(products) {
    let producto = [];
    for (let i = 0; i < products.length; i++) {
        producto.push(JSON.stringify({"nombre": products[i].Nombre, "precio": products[i].Precio, "cantidad":products[i].Cantidadproduct}));
    }

  try {
    const response = await fetch(`${baseUrl}/solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({"producto" : producto, "correo": correo}) // Reemplaza con los datos necesarios
    });

    console.log('respuesta: ', response);
  } catch (error) {
    console.error('Error en POST:', error);
  }
  showMenu();
}

/*
async function fetchPost(products) {
    const fetch = (await import('node-fetch')).default;
    try {
        for (let product of products) {
            await fetchPost1(product);
        }
    } catch (error) {
        console.error('Error en POST:', error);
    }
    showMenu();
}
*/
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
    console.log('\nMail registrado');
    showMenu();
}

function showMenu() {
    let choice = '0';
    console.log('\nMenú:');
    console.log('1. Realizar solicitud producto unico POST');
    console.log('2. Realizar solicitud producto multiple POST');
    console.log('3. Ingresar nuevo mail de confirmación');
    console.log('4. Salir');
    choice = readlineSync.question('Seleccione una opcion: ');
    let stream;
    if (choice === '1') {
        choice = '';
        let found = false;
        stream = fs.createReadStream(jsonFilePath)
            .pipe(JSONStream.parse('*'))
            .on('data', product => {
                if (!found) {
                    found = true;
                    fetchPost1(product);
                }
            })
            .on('end', () => {
                if (!found) {
                    console.log('No se encontró ningún producto.');
                }
            });
    } else if (choice === '2') {
        choice = '';
        const cantidad = readlineSync.question('Seleccione cantidad de productos (max 10 millones): ');
        let products = [];
        let found = false;
        stream = fs.createReadStream(jsonFilePath)
            .pipe(JSONStream.parse('*'))
            .on('data', product => {
                if (products.length < cantidad) {
                    products.push(product);
                } else {
                    found = true;
                    fetchPost(products);
                }
            })
            .on('end', () => {
                if (!found) {
                    console.log('No se encontró ningún producto.');
                }
            });
    }  else if (choice === '3') {
        choice = '';
        mail();
    } else if (choice === '4') {
        choice = '';
        console.log('Saliendo...');
        process.exit(0);
    } else {
        console.log('Opción no válida. Intente de nuevo.');
        showMenu();
    }
}

// Inicia el servidor Express
app.listen(port, () => {
  console.log(`Servidor API escuchando en http://localhost:${port}`);
  // Mostrar menú al iniciar
  showMenu();
});
