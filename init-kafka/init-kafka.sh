#!/bin/bash

# Wait for Kafka to be ready
cub kafka-ready -b kafka:9092 1 20

# Create topics if they don't exist
kafka-topics.sh --create --topic solicitudes-topic --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1
kafka-topics.sh --create --topic procesamiento-topic --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1

# Create consumer groups
kafka-consumer-groups.sh --bootstrap-server kafka:9092 --create --group solicitud-group
kafka-consumer-groups.sh --bootstrap-server kafka:9092 --create --group procesamiento-group
kafka-consumer-groups.sh --bootstrap-server kafka:9092 --create --group notificacion-group

# Keep the container running
tail -f /dev/null
