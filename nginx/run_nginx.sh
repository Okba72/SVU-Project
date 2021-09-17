#!/bin/bash
#

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

mkdir -p ${SCRIPTPATH}/var/lib/nginx/tmp 
mkdir -p ${SCRIPTPATH}/var/log/nginx
mkdir -p ${SCRIPTPATH}/var/run

nginx -p ${SCRIPTPATH}  -c ${SCRIPTPATH}/routers_nginx.conf 