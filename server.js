'use strict'

var http = require('http')
var port=8080;

var state = { value: 0, version: 0 }
var responses = []

function handleRequest(request, response) {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8070');

  if (request.method == 'POST') {
    var body = '';

    request.on('data', function (data) {
      body += data;
    });

    request.on('end', function () {
      var newState = JSON.parse(body)
      if (newState.value !== undefined) {
        state = newState
        for (var i = 0; i < responses.length; ++i) {
          responses[i].end(JSON.stringify(newState))
        }
        responses = []
        response.end('ok')
      } else if (newState.version !== state.version) {
        response.end(JSON.stringify(state))
      } else {
        responses.push(response)
        setTimeout(function() {
          var index = responses.indexOf(response)
          if (index >= 0) {
            response.end(JSON.stringify(newState))
            responses.splice(index, 1)
          }
        }, 10000)
      }
    })
  }
}

var server = http.createServer(handleRequest)

server.listen(port, function(){
  console.log("Server listening on: http://localhost:%s", port)
});
