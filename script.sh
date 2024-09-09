#!/bin/bash
sudo docker-compose down
sudo docker rmi tax-next-app:latest
sudo docker-compose up -d