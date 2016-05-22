'use strict'

let http = require('http')
const port=8080;

let value = "0"
let responses = []

function handleRequest(request, response) {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8070');

  if (request.method == 'POST') {
    let body = '';

    request.on('data', function (data) {
      body += data;
    });

    request.on('end', function () {
      value = body
      for (let i = 0; i < responses.length; ++i) {
        responses[i].end(value)
      }
      responses = []
      response.end('ok')
    });
  } else {
    responses.push(response)
    setTimeout(function() {
      const index = responses.indexOf(response)
      if (index >= 0) {
        response.end(value)
        responses.splice(index, 1)
      }
    }, 10000)
  }
}

var server = http.createServer(handleRequest)

server.listen(port, function(){
  console.log("Server listening on: http://localhost:%s", port)
});
