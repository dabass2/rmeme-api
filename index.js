const express = require('express')
const app = express()
const fs = require('fs');
const multer = require('multer')

app.use( express.json() )
app.use( multer().any() )

app.listen(9000, () => {
    console.log('listening on 9000')
});

const url = 'http://leinad.pw/rmeme/images/memes/'


// get requests //////////////////////////
app.get('/rmeme', (req, res) => {
    try {
        var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        var num = Math.floor(images.size * Math.random())
        var file = images.images[num]
        // console.log(file)
        if (file.format === 'JPEG') { var format = 'jpg' }
        res.status(200).json({
            id: num,
            name: file.name,
            url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
            format: file.format,
            score: file.score
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
        // console.log(file)
        var format = (file.format === 'JPEG' ? 'jpg' : file.format.toLowerCase())
        res.status(200).json({
            id: id,
            name: file.name,
            url: `${url}${file.name}.${format}`,
            format: file.format,
            score: file.score
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
app.put('/rmeme/:id/up', (req, res) => {
    try {
        id = req.params.id
        var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        var file = images.images[id]
        // console.log(file)
        file.score += 1
        fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
        if (file.format === 'JPEG') { var format = 'jpg' }
        res.status(200).json({
            id: id,
            name: file.name,
            url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
            format: file.format,
            score: file.score
        })  
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error when upvoting meme ${req.params.id}`)
    }
});

app.put('/rmeme/:id/down', (req, res) => {
    try {
        id = req.params.id
        var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        var file = images.images[id]
        file.score -= 1
        fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
        if (file.format === 'JPEG') { var format = 'jpg' }
        res.status(200).json({
            id: id,
            name: file.name,
            url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
            format: file.format,
            score: file.score
        })  
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error when downvoting meme ${req.params.id}`)
    }
})
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
    res.status(200).send('This is currently under construction.')
    // try {
    //     id = req.params.id
    //     var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
    //     var size = images.size
    //     if (id == size) {
    //         delete images[id]
    //     } else {
    //         images.images[id] = images.images[size-1]
    //         delete images.images[size-1]
    //     }
    //     images.size -= 1
    //     fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
    //     res.status(200).send(`Successfully deleted meme ${id}`)  
    // } catch(e) {
    //     console.log(e)
    //     res.status(500).send(`Error when deleting meme ${req.params.id}`)
    // }
});
////////////////////////////////////////