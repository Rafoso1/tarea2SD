import json
import random

# Configuracion
NUM_PRODUCTS = 10000000  # Cambia este valor para ajustar la cantidad de productos
PRICE_RANGE = (1000, 100000)  # Rango de precios (minimo, maximo)
QUANTITY_RANGE = (1, 50)  # Rango de cantidades (minimo, maximo)
NAMES = ["ProductoA", "ProductoB", "ProductoC", "ProductoD", "ProductoE"]  # Lista de nombres de productos

# Funcion para generar una descripcion aleatoria
def generate_description():
    lore = (
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
        "Pellentesque vitae velit ex. Mauris venenatis dui eu turpis suscipit, "
        "et facilisis nunc bibendum. Integer efficitur, justo in sollicitudin accumsan, "
        "lectus orci pellentesque metus, a ullamcorper nulla dolor vel quam."
    )
    return lore

# Generar el dataset
products = []
for i in range(NUM_PRODUCTS):
    product = {
        "ID": i,
        "Nombre": random.choice(NAMES) + str(i),
        "Precio": round(random.uniform(*PRICE_RANGE), 0),  # Precio con cero decimales
        "Cantidad": random.randint(*QUANTITY_RANGE),
        "Descripcion": generate_description()
    }
    products.append(product)

# Guardar el dataset en un archivo JSON
with open("ecommerce_dataset.json", "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=4)

print(f"Dataset generado con {NUM_PRODUCTS} productos y guardado en 'ecommerce_dataset.json'")