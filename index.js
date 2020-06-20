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
const requests = {"get": 0, "put": 1, "post": 2, "delete": 3}

function createToken() {
    return (Math.random()*1e16).toString(36) + (Math.random()*1e16).toString(36)
}

function decreaseAccess(token) {
    var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    var user = userList.tokens[token]
    user.numAccesses -= 1
    fs.writeFileSync('./users.json', JSON.stringify(userList, undefined, 2))
}

function checkLevel(token, requestType) {
    try {
        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        var user = userList.tokens[token]
        console.log(user)
        let now = new Date()
        let oldDate = new Date(user.lastAccess)
        if (oldDate.getUTCDay() != now.getUTCDay() && oldDate.getUTCHours() <= now.getUTCHours()) {
            user.numAccesses = 0
            user.lastAccess = now
        }

        if (user.accessLevel >= requests[requestType]) {
            if (user.numAccesses > user.maxAccesses) {
                console.log("Reached max accesses.")
                return null
            }

            user.numAccesses += 1
            fs.writeFileSync('./users.json', JSON.stringify(userList, undefined, 2))
            return true
        }
        return false
    } catch(e) {
        console.log(e)
        return false
    }
}


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

app.get('/rmeme/user/:token', (req, res) => {
    try {
        var token = req.params.token
        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        var user = userList.tokens[token]
        if (!user) {
            res.status(400).send(`No user with token ${token} found.\n`)
            return
        }
        res.status(200).send(user)
    } catch(e) {
        console.log(e)
        res.status(500).send(`Error retrieving token: ${req.params.token}\n`)
    }
})
////////////////////////////////////////////


////////////// put requests ////////////////
app.put('/rmeme/:id/up', (req, res) => {
    var token = req.body.token
    let check = checkLevel(token, "put")
    if (!check) {
        if (check === null) {
            res.status(400).send(`Max daily accesses reached with token ${token}.\n`)
            return
        }
        res.status(500).send(`Invalid user permissions for this request. Recieved token ${token}\n`)
        return
    }

    try {
        var id = req.params.id
        var votes = Number(req.body.votes)
        if (!votes) {
            console.log(votes)
            decreaseAccess(token)
            res.status(400).send(`Error with votes argument.\n`)
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
        decreaseAccess(req.body.token)
        res.status(500).send(`Error when upvoting meme ${req.params.id}\n`)
    }
});

app.put('/rmeme/:id/down', (req, res) => {
    var token = req.body.token
    let check = checkLevel(token, "put")
    if (!check) {
        if (check === null) {
            res.status(400).send(`Max daily accesses reached with token ${token}.\n`)
            return
        }
        res.status(500).send(`Invalid user permissions for this request. Recieved token ${token}\n`)
        return
    }

    try {
        var id = req.params.id
        var votes = Number(req.body.votes)
        if (!votes) {
            console.log(votes)
            decreaseAccess(token)
            res.status(400).send(`Error with votes argument.\n`)
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
        decreaseAccess(req.body.token)
        res.status(500).send(`Error when downvoting meme ${req.params.id}\n`)
    }
})
///////////////////////////////////////////


// post requests //////////////////////////
app.post('/rmeme/create', (req, res) => {   // holy shit LMFAO
    var token = req.body.token
    let check = checkLevel(token, "post")
    if (!check) {
        if (check === null) {
            res.status(400).send(`Max daily accesses reached with token ${token}.\n`)
            return
        }
        res.status(400).send(`Invalid user permissions for this request. Recieved token ${token}\n`)
        return
    }
    
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
            if (code !== '0') {
                decreaseAccess(req.body.token)
                res.status(500).send('Error when uploading meme.\n')
                return
            }
            
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
        decreaseAccess(req.body.token)
        res.status(500).send('Error when uploading meme.\n')
    })
});

app.post('/rmeme/user/create', (req, res) => {
    try {
        var token = req.body.token
        let check = checkLevel(token, "post")
        if (!check) {
            if (check === null) {
                res.status(400).send(`Max daily accesses reached with token ${token}.\n`)
                return
            }
            res.status(400).send(`Invalid user permissions for this request. Recieved token ${token}\n`)
            return
        }

        var id = req.body.id
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        var token = createToken()
        let date = new Date()

        if (!id.match(emailRegex)) {
            res.status(400).send(`Invalid email ${id}.\n`)
            return
        }

        if (Object.keys(userList.ids).includes(id)) {
            decreaseAccess(req.body.token)
            res.status(400).send("Email already exists. Send get request to '/rmeme/user/:token' for user information.\n")
            return
        }
        userList.ids[id] = token
        userList.tokens[token] = {"id": id, "numAccesses": 0, "lastAccess": date, "accessLevel": 1, "maxAccesses": 10}
        fs.writeFileSync('./users.json', JSON.stringify(userList, undefined, 2))
        res.status(200).json({
            'token': token,
            'id': id,
            'numAccesses': 0,
            'lastAccess': date,
            'accessLevel': 1,
            'maxAccesses': 10 
        })
    } catch(err) {
        console.log(err)
        decreaseAccess(req.body.token)
        res.status(500).send("Error creating new user.\n")
    }
})
//////////////////////////////////////////


// delete requests //////////////////////
app.delete('/rmeme/del/:id', (req, res) => {    // lole
    try {
        var token = req.body.token
        let check = checkLevel(token, "delete")
        if (!check) {
            if (check === null) {
                res.status(400).send(`Max daily accesses reached with token ${token}.\n`)
                return
            }
            res.status(400).send(`Invalid user permissions for this request. Recieved token ${token}\n`)
            return
        }

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
        decreaseAccess(req.body.token)
        res.status(500).send(`Error when deleting meme ${req.params.id}\n`)
    }
});

app.delete('/rmeme/user/del/:id', (req, res) => {
    try {
        var token = req.body.token
        let check = checkLevel(token, "delete")
        if (!check) {
            if (check === null) {
                res.status(400).send(`Max daily accesses reached with token ${token}.\n`)
                return
            }
            res.status(400).send(`Invalid user permissions for this request. Recieved token ${token}\n`)
            return
        }

        var userList = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        let usrToken = userList.ids[req.params.id]
        delete userList.tokens[usrToken]
        delete userList.ids[req.params.id]
        fs.writeFileSync('./users.json', JSON.stringify(userList, undefined, 2))
        res.status(200).send(`Successfully deleted user with id ${req.params.id}\n`) 
    } catch(e) {
        console.log(e)
        decreaseAccess(req.body.token)
        res.status(500).send(`Error when deleting user with id ${req.params.id}\n`)
    }
})
////////////////////////////////////////