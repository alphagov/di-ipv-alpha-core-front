#!/usr/bin/env bash

[[ -d keys ]] || mkdir keys

openssl genrsa -out keys/private-di-ipv-atp-playbox.pem 2048
openssl rsa -in keys/private-di-ipv-atp-playbox.pem -pubout -out keys/public-di-ipv-atp-playbox.pem