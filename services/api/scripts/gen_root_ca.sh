#!/bin/bash
#
SSL_ROOT_CA_HOME=~/.ca_certs/root_ca

if [[ ! -e $SSL_ROOT_CA_HOME/root_ca_key.pem ]]; then
    echo "root_ca_key.pem does not exist!\npelase generate one before running this script\n"
    exit 1
fi

if [[ -e $SSL_ROOT_CA_HOME/root_ca.pem ]]; then
    echo "this will override existing ca certificate, are you sure you want to proceed?"
    read -p " please answer YES to continue: " user_answer
    echo $user_answer
    if [[ $user_answer != "YES" ]]; then
        echo "aborting ...."
        exit 1
    fi
fi

######################
# Become a Certificate Authority
######################
# Generate root certificate
openssl req -x509 -new -nodes -key ${SSL_ROOT_CA_HOME}/root_ca_key.pem -sha256 -days 3600 -out ${SSL_ROOT_CA_HOME}/root_ca.pem
# chmod 400 ${SSL_ROOT_CA_HOME}/root_ca.pem

######################
######################

