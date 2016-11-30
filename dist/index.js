"use strict";
const http_1 = require('http');
const parser_1 = require('./parser');
http_1.createServer((req, res) => {
    let parser = new parser_1.Parser();
    res.setHeader('Access-Control-Allow-Origin', '*');
    parser.parse(req, res).on('end', (data) => {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    });
}).listen(5051);
//# sourceMappingURL=index.js.map