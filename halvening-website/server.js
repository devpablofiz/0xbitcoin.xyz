let path = require('path');

const fs = require('fs');
const http = require('http');
const https = require('https');
let express = require('express');

let app = express();
const port = 80;

const privateKey = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/fullchain.pem', 'utf8');
//eventualmente cambiare cert.pem in fullchain.pem ma non so a che serve

app.enable('trust proxy')
app.use((req, res, next) => {
    req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

//shows public content for react
//works for certbot auto renew directory too
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);
console.log(`Server listening on port 443`)

app.listen(port, function () {
    console.log(`Server listening on port ${port}`)
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
});

