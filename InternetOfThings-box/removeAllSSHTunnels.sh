#!/bin/bash

# verifica se  o tunnel existe se não executa o script para o criar
for x in "$(ps aux | grep  "ssh -N -R" | grep -v auto |  tr -s " " " " | cut -d' ' -f2)"; do
	sudo kill -9 $x
done

echo "done."