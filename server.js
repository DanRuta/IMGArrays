"use strict"

const http = require("http")
const fs = require("fs")
const url = require("url")
const PORT = 1337

http.createServer((request, response) => {

    let path = url.parse(request.url).pathname
    let data

    path = (path=="/"?"/demo.html":path)

    console.log(path)

    switch(path){
        default:
            try {
                data = fs.readFileSync(__dirname+path)
            } catch (e) {
                console.log(e)
            }
    }

    response.end(data)

}).listen(PORT, () => console.log(`Server Listening on port ${PORT}`))

