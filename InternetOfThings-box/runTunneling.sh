#!/bin/bash
# verifica se  o tunnel existe se não executa o script para o criar
for x in "$(ps aux | grep  "ssh -fN -R" | grep -v pts/0 |  tr -s " " " " | cut -d' ' -f2)"; do
	sudo kill -9 $x
done

`ssh -fN -R $1:$2:$3 $4@$5 -p $6 2> createTunnel.log`

echo "ssh -fN -R $1:$2:$3 $4@$5 -p $6 2> createTunnel.log"
echo "tunnel run."

# Ciar tunel
# Porta Remota para acesso 							= 8000
# Ip no dispositivo remoto para ligar pelo tunel 	= localhost
# Porta local para escuta de eventos 				= 3000
# User remoto destino do tunel 						= root
# Ip remoto destino do tunel 						= 192.168.1.85

# ssh -fN -R 8000:localhost:3000 root@192.168.1.85

# criar par de chaves RSA
# ssh-keygen -t rsa

# Enviar chave publica para o dispositivo remoto
# ssh-copy-id root@192.168.1.85