
### Creating certification
>openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-private.pem -out localhost-cert.pem