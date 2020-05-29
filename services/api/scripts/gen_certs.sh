#!/bin/bash
#
SSLHOME=../config/ssl

openssl genrsa -out ${SSLHOME}/key.pem 4096
openssl req -new -key ${SSLHOME}/key.pem -out ${SSLHOME}/csr.pem
openssl x509 -req -days 9999 -in ${SSLHOME}/csr.pem -signkey ${SSLHOME}/key.pem -out ${SSLHOME}/cert.pem
rm ${SSLHOME}/csr.pem

