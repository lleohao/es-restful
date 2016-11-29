import { createServer, request, RequestOptions } from 'http';
import { Parser } from './parser';
import { parse } from 'url';

createServer((req, res) => {
    let parser = new Parser();
    let result = parser.parse(req, res);

    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(JSON.stringify(result));
}).listen(5051);