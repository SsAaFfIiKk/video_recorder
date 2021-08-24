const fs = require('fs')
const key = fs.readFileSync('certs/privkey.pem')
const cert = fs.readFileSync('certs/cert.pem')
const credentials = { key: key, cert: cert }

const host = '0.0.0.0'
const port = 8001

const express = require('express')
const app = express()
const server = require('https').createServer(credentials, app)
const io = require('socket.io')(server, { path: '/socket.io' })

app.set('view engine', 'ejs')
app.use(express.static('public'))

const qwList = ["Раскажите о себе, об образовании, об опыте работы.", "Что для вас идеальная вакансия?", "Проходили ли вы курсы повышения квалификации?",
"Когда вы начили заниматься данным направлением работы?", "Решение каких задач вызывает у вас наибольший интерес?"]

app.get("/timestamp", (req, res) => {
  let now = new Date().toLocaleTimeString();
  console.log(now)
  res.send("get time")
})

app.get("/get_qw", (req, res) => {
  res.send(qwList)
})

app.get('/record', (req, res) => {
  const fname_prefix = req.query.fname_prefix;
  const chunk_time = req.query.chunk_time;
  res.render('record', { fname_prefix: fname_prefix || 'noname', chunk_time: chunk_time || 1000 })
})

io.on('connection', socket => {
  socket.on('recorded-chunk', (data) => {
    var fileStream = fs.createWriteStream(`./rec/${data.filename}.webm`, { flags: 'a' } );
    fileStream.write(Buffer.from(new Uint8Array(data.chunk)));
    console.log('chunk recieved');
  })
})

server.listen(port, host, () => {
  console.log(`server running at link: https://${host}:${port}`);
  console.log(`record video page: https://${host}:${port}/record`);
})