const http = require('http');

const server = http.createServer((req, res)=>{
    const url = req.url;
    const method = req.method;

    if(url==='/'){
        res.write('<html>');
        res.write('<head><title>Home Page</title></head>');
        res.write('<body><h1>Welcome to my server</h1><form action="/create-user" method="POST"><input type="text" name="username"><button type="submit">Submit</button></form></body>');
        res.write('</html>');
        return res.end();
    }

    if(url==='/users'){
        res.write('<html>');
        res.write('<head><title>Users Page</title></head>');
        res.write('<body><ul><li>User 1</li><li>User 2</li><li>User 3</li></ul></body>');
        res.write('</html>');
        return res.end();
    }

    if(url==='/create-user' && method==='POST'){
        const body = [];
        req.on('data', (chunk)=>{
            body.push(chunk);
        });
        return req.on('end', ()=>{
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            console.log(message);
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end();
        })
    }

    res.write('<html>');
    res.write('<head><title>Home Page</title></head>');
    res.write('<body><h1>Welcome to my server</h1></body>');
    res.write('</html>');
    res.end();
});

server.listen(3000);