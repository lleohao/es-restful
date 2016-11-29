"use strict";
const http_1 = require('http');
const parser_1 = require('./parser');
http_1.createServer((req, res) => {
    let parser = new parser_1.Parser();
    let result = parser.parse(req, res);
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(JSON.stringify(result));
}).listen(5051);
//# sourceMappingURL=index.js.map