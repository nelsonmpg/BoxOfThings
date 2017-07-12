#!/bin/bash

bail() {
	echo 'Error executing command, exiting'
	exit 1
}

exec_cmd_nobail() {
	echo "+ $1"
	bash -c "$1"
}

exec_cmd() {
	exec_cmd_nobail "$1" || bail
}


print_status() {
	if [ -f /etc/redhat-release ]; then
	  local outp=$(echo "$1") # | sed -r 's/\\n/\\n## /mg')
	  echo
	  echo -e "## ${outp}"
	  echo
	fi

	if [ -f /etc/lsb-release ]; then	  
		echo
		echo "## $1"
		echo
	fi
}

if test -t 1; then # if terminal
    ncolors=$(which tput > /dev/null && tput colors) # supports color
    if test -n "$ncolors" && test $ncolors -ge 8; then
    	termcols=$(tput cols)
    	bold="$(tput bold)"
    	underline="$(tput smul)"
    	standout="$(tput smso)"
    	normal="$(tput sgr0)"
    	black="$(tput setaf 0)"
    	red="$(tput setaf 1)"
    	green="$(tput setaf 2)"
    	yellow="$(tput setaf 3)"
    	blue="$(tput setaf 4)"
    	magenta="$(tput setaf 5)"
    	cyan="$(tput setaf 6)"
    	white="$(tput setaf 7)"
    fi
fi

print_bold() {
	title="$1"
	text="$2"

	echo
	echo "${red}================================================================================${normal}"
	echo
	echo  "    	${bold}${yellow}${title}${normal}"
	echo
	echo  "  ${text}"
	echo
	echo "${red}================================================================================${normal}"
}
print_bold \
"                            Box Of Things                           " "\
${bold} Install Box Of Things ${normal}"

# If system redhat
if [ -f /etc/redhat-release ]; then

	distro=$(sed -n 's/^distroverpkg=//p' /etc/yum.conf)
	releasever=$(rpm -q --qf "%{version}" -f /etc/$distro)
	basearch=$(rpm -q --qf "%{arch}" -f /etc/$distro)

	print_status "Add source list mongodb."
	exec_cmd "echo '[mongodb-org-3.2]' > /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'name=MongoDB Repository' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.2/x86_64/' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'gpgcheck=1' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'enabled=1' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc' >> /etc/yum.repos.d/mongodb-org.repo"

	exec_cmd "sudo yum repolist"

	print_status "Install nodejs version 8."
	exec_cmd "curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -"
	exec_cmd "sudo yum install -y nodejs"

	print_status "Install git."
	exec_cmd "sudo yum install -y git"

	print_status "Install database MongoDB."
	exec_cmd "sudo yum install -y  mongodb-org"
	exec_cmd "sudo systemctl start mongod || sudo systemctl reload mongod"

#fi
# if system debian
elif [ -f /etc/lsb-release ]; then
	DISTRO=$(lsb_release -c -s)

	check_alt() {
		if [ "X${DISTRO}" == "X${2}" ]; then
			echo
			echo "## You seem to be using ${1} version ${DISTRO}."
			echo "## This maps to ${3} \"${4}\"... Adjusting for you..."
			DISTRO="${4}"
		fi
	}

  	print_status "Add source list mingodb."
  	exec_cmd "sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927"
  	exec_cmd "echo 'deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list"

  	print_status "Install nodejs version 8."
  	exec_cmd "curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -"
  	exec_cmd "sudo apt-get install -y nodejs"

  	print_status "Install git."
  	exec_cmd "sudo apt-get install -y git"

  	print_status "Install database MongoDB."
  	exec_cmd "sudo apt-get install -y mongodb mongodb-server"

fi

cd
print_status "Clone git repository Box Of Things"
exec_cmd 'git clone https://github.com/nelsonmpg/BoxOfThings'

print_status "Install node models"
exec_cmd "cd $(pwd)/BoxOfThings/InternetOfThings-box/ && sudo npm install"

# print_status "Install module to run BoxOfThings."
# exec_cmd "sudo npm install pm2 -g"
# cd
# exec_cmd "cd $(pwd)/BoxOfThings/InternetOfThings-box/ && sudo pm2 start main.js --name 'BoxOfThings' || true"
# exec_cmd "sudo pm2 save || true"
# exec_cmd "sudo pm2 startup systemd || true"


print_bold \
"                            Box Of Things                           " "\
	${bold} This install complete.
	${yellow} Restart your system ${normal}
	${bold} Access your favorite browser and access to this server at
	${blue} http://$(hostname -I) ${normal}
	 Use
		---------------------------
		| user : \"admin@admin.pt\" |
		| pass : \"admin\"          |
		---------------------------
"

exit 0