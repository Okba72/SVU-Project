#!/bin/bash
#
SSL_ROOT_CA_HOME=~/.ca_certs/root_ca

if [[ -e $SSL_ROOT_CA_HOME/root_ca_key.pem ]]; then
    echo "this will override existing key, are you sure you want to proceed?"
    read -p " please answer YES to continue: " user_answer
    # user_answer=${$user_answer,,}
    echo $user_answer
    if [[ $user_answer != "YES" ]]; then
        echo "aborting ...."
        exit 1
    fi
fi

mkdir -p $SSL_ROOT_CA_HOME

######################
# Become a Certificate Authority
######################
# Generate private key
openssl genrsa -des3 -out ${SSL_ROOT_CA_HOME}/root_ca_key.pem 4096
chmod 400 ${SSL_ROOT_CA_HOME}/root_ca_key.pem

######################
######################

