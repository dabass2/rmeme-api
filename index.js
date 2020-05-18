const express = require('express')
const fs = require('fs')
const download = require('image-downloader')
const bodyParser = require('body-parser')
const spawn = require("child_process").spawn;

const app = express()
app.use( express.json() )
app.use( bodyParser.urlencoded({extended: false}) )


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
        res.status(500).send('Error retrieving random meme.\n')
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
        res.status(500).send('Invalid meme ID. Retrieval error.\n')
    }
});

app.get('/rmeme/memes/total', (req, res) => {
    try {
        var file = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        res.status(200).json({total: file.size})
    } catch(e) {
        console.log(e)
        res.status(500).send('Error when receiving total number of memes.\n')
    }
})

app.get('/rmeme/user/:id', (req, res) => {
    try {
        var id = req.params.id
        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        var user = userList[id]
        res.status(200).json({
            'id': id,
            'token': user.token
        })
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error retrieving user with id: ${req.params.id}\n`)
    }
})
////////////////////////////////////////////


////////////// put requests ////////////////
app.put('/rmeme/:id/up', (req, res) => {
    try {
        var id = req.params.id
        var votes = Number(req.body.votes)
        if (!votes) {
            console.log(votes)
            res.status(500).send(`Error with votes argument.\n`)
        } else {
            var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
            var file = images.images[id]
            file.score += votes
            fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
            if (file.format === 'JPEG') { var format = 'jpg' }
            res.status(200).json({
                id: id,
                name: file.name,
                url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
                format: file.format,
                score: file.score
            })  
        }
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error when upvoting meme ${req.params.id}\n`)
    }
});

app.put('/rmeme/:id/down', (req, res) => {
    try {
        var id = req.params.id
        var votes = Number(req.body.votes)
        if (!votes) {
            console.log(votes)
            res.status(500).send(`Error with votes argument.\n`)
        } else {
            var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
            var file = images.images[id]
            file.score -= votes
            fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
            if (file.format === 'JPEG') { var format = 'jpg' }
            res.status(200).json({
                id: id,
                name: file.name,
                url: `${url}${file.name}.${format.toLocaleLowerCase()}`,
                format: file.format,
                score: file.score
            })  
        }
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error when downvoting meme ${req.params.id}\n`)
    }
})

app.put('/rmeme/validate/:id', (req, res) => {
    try {
        var id = req.params.id
        var recToken = req.body.token
        var recSecret = req.body.secret
        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'))
        var user = userList[id]
        if (!user) {
            res.status(500).send(`No user ${id} exists.\n`)
            return
        }

        if (recToken === user.token) {
            if (recSecret === user.secret) {
                res.status(200).send(true)
            } else {
                res.status(200).send(false)
            }
        } else {
            res.status(200).send(false)
        }
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error validating user with id: ${req.params.id}\n`)
    }
})
///////////////////////////////////////////


// post requests //////////////////////////
app.post('/rmeme/create', (req, res) => {   // holy shit LMFAO
    var name = ''
    const options = {
        url: req.body.url,
        dest: __dirname + '/images/'
    }
    
    download.image(options).then(({ filename }) => {
        console.log('Saved to', filename)
        let python = spawn('python',["./convertImg.py", filename])
        
        python.stdout.on('data', (data) => {
            name = data.toString().trim()
        })

        python.on('exit', code => {
            console.log(`Exited with code: ${code}`)
            var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
            var size = images.size.toString()
            images.images[size] = {"name": name, "format": "JPEG", "score": 100}
            images.size += 1
            var newId = images.size-1    // fix later lole
            fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
            res.status(200).json({
                id: newId,
                name: name,
                url: `${url}${name}.jpg`,
                format: 'JPEG',
                score: 100
            })
        })
    }).catch((e) => {
        console.log(e)
        res.status(500).send('Error when uploading meme.\n')
    })
});

app.post('/rmeme/create/user', (req, res) => {
    try {
        function createToken() {
            return (Math.random()*1e16).toString(36) + (Math.random()*1e16).toString(36)
        }

        function createSecret() {
            return (Math.random()*1e16).toString(36) + (Math.random()*1e16).toString(36) + (Math.random()*1e16).toString(36) + (Math.random()*1e16).toString(36)
        }

        var id = req.body.id
        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        var token = createToken()
        var secret = createSecret()
        
        if (Object.keys(userList).includes(id)) {
            res.status(500).send("User already exists. Send get request to '/rmeme/user/:id' for user information.\n")
            return
        }
        userList[id] = {"token": token, "secret": secret}
        fs.writeFileSync('./users.json', JSON.stringify(userList, undefined, 2))
        res.status(200).json({
            'id': id,
            'token': token,
            'secret': secret
        })
    } catch(err) {
        console.log(err)
        res.status(500).send("Error creating new user.\n")
    }
})
//////////////////////////////////////////


// delete requests //////////////////////
app.delete('/rmeme/del/:id', (req, res) => {    // lole
    try {
        id = req.params.id
        var images = JSON.parse(fs.readFileSync('./images.json', 'utf8'));
        var size = images.size
        if (id == size) {
            delete images[id]
        } else {
            images.images[id] = images.images[size-1]
            delete images.images[size-1]
        }
        images.size -= 1
        fs.writeFileSync('./images.json', JSON.stringify(images, undefined, 2))
        res.status(200).send(`Successfully deleted meme ${id}\n`)  
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error when deleting meme ${req.params.id}\n`)
    }
});
////////////////////////////////////////