import { createServer, request, RequestOptions } from 'http';
import { Parser } from './parser';
import { parse } from 'url';

createServer((req, res) => {
    let parser = new Parser();
    res.setHeader('Access-Control-Allow-Origin', '*');

    parser.parse(req, res).on('end', (data: any) => {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(data));
    })

    res.setTimeout(2000, () => {
        res.end();
    })

}).listen(5051);