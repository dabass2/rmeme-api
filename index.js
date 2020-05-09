const express = require('express')
const app = express()
const fs = require('fs');
const multer = require('multer')

app.use( multer().any() )

app.listen(3000, () => {
    console.log('listening on 3000')
})

app.get('/rmeme', (req, res) => {
    var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
    var num = Math.floor(images.size * Math.random())
    var file = images.images[num]
    console.log(file)
    // var format = file.format  // format should always be jpg, but..
    // if (format == "JPEG") {
    //     format = "jpg"
    // }
    // console.log(file.name + '.' + format)
    // res.sendFile(__dirname + '/index.html')
    res.send(file)
})

app.post('/rmeme/add', (req, res) => {
    console.log(req.body)
    res.send('200')
})