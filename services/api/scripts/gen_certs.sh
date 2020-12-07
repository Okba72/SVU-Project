#!/bin/bash
#
SSL_ROOT_CA_HOME=~/.ca_certs/root_ca

SVU_SSL_HOME=../config/ssl

######################
# Create CA-signed certs
######################


# Generate a private key
if [[ ! -e ${SVU_SSL_HOME}/key.pem ]]; then
    openssl genrsa -out ${SVU_SSL_HOME}/key.pem 4096
fi

# Create a certificate-signing request
openssl req -new -key ${SVU_SSL_HOME}/key.pem -out ${SVU_SSL_HOME}/cert.csr
# Create a config file for the extensions
>${SVU_SSL_HOME}/cert.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost # Be sure to include the domain name here because Common Name is not so commonly honoured by itself
#DNS.2 = bar.$SVU_DOMAIN_NAME # Optionally, add additional domains (I've added a subdomain here)
IP.1 = 127.0.0.1 # Optionally, add an IP address (if the connection which you have planned requires it)
EOF
# Create the signed certificate
openssl x509 -req -in ${SVU_SSL_HOME}/cert.csr -CA $SSL_ROOT_CA_HOME/root_ca.pem \
    -CAkey $SSL_ROOT_CA_HOME/root_ca_key.pem -CAcreateserial \
    -out ${SVU_SSL_HOME}/cert.pem -days 825 -sha256 -extfile ${SVU_SSL_HOME}/cert.ext