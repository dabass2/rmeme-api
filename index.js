const express = require('express')
const app = express()
const fs = require('fs');
const multer = require('multer')

app.use( express.json() )
app.use( multer().any() )

app.listen(3000, () => {
    console.log('listening on 3000')
});

const url = 'http://leinad.pw/rmeme/images/memes/'


// get requests //////////////////////////
app.get('/rmeme', (req, res) => {
    try {
        var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        var num = Math.floor(images.size * Math.random())
        var file = images.images[num]
        if (file.format === 'JPEG') { var format = 'jpg' }
        res.status(200).json({
            id: num,
            name: file.name,
            url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
            format: file.format,
            score: file.score,
            author: 'anonymous', // todo
            created: new Date() // todo
        });
    } catch(e) {
        console.log(e)
        res.status(500).send('Error retrieving random meme.')
    }

});

app.get('/rmeme/:id', (req, res) => {
    try {
        id = req.params.id
        var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        var file = images.images[id]
        console.log(id)
        if (file.format === 'JPEG') { var format = 'jpg' }
        res.status(200).json({
            id: id,
            name: file.name,
            url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
            format: file.format,
            score: file.score,
            author: 'anonymous',
            created: new Date()
        });
    } catch(e) {
        console.log(e)
        res.status(500).send('Invalid meme ID. Retrival error.')
    }
});

app.get('/rmeme/memes/total', (req, res) => {
    try {
        var file = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        res.status(200).json({total: file.size})
    } catch(e) {
        console.log(e)
        res.status(500).send('Error when recieving total number of memes.')
    }
})
////////////////////////////////////////////


// put requests ////////////////////////////
app.put('/rmeme/:id', (req, res) => {
    console.log("will update a meme by id")
    res.send('200')
});
///////////////////////////////////////////


// post requests //////////////////////////
app.post('/rmeme/:id', (req, res) => {
    console.log('will create a new meme')
    // console.log(req.body)
    // console.log(req.params.id)
    res.send('200')
});
//////////////////////////////////////////


// delete requests //////////////////////
app.delete('/rmeme/del/:id', (req, res) => {
    console.log('will delete a meme by id')
    res.send('200')
});
////////////////////////////////////////