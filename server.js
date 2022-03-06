const fs = require('fs')
const key = fs.readFileSync('certs/privkey.pem')
const cert = fs.readFileSync('certs/cert.pem')
const credentials = { key: key, cert: cert }
const cors = require('cors')

const host = '0.0.0.0'
const port = 8001

const express = require('express')
const app = express()
const server = require('https').createServer(credentials, app)
const io = require('socket.io')(server, { path: '/socket.io' })

app.set('view engine', 'ejs')
app.use(cors())
app.options('*', cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

const qwList = ["Как часто Вы меняете работу ?",
        "Есть ли у Вас патенты ? Если да, то какие ?",
        "Как часто Вы публикуете статьи ?",
        "Индексируются ли Ваши работы в scopus ?",
        "Часто ли цитируют Ваши статьи ?",
        "Принимали ли Вы участие в государственных грантах ?",
        "В каких исследованиях Вы были руководителем ?",
        "Насколько легко Вам дается общение с незнакомыми людьми ?",
        "Как много времени Вы проводите в социальных сетях ?",
        "Часто ли у Вас бывает плохое настроение ? Если да, влияет ли Ваше настроение на работу ?",
        "Есть ли у Вас аккаунты в тематических блогах, например на Habr.ru ?"]

app.get("/timestamp", (req, res) => {
    const fname_prefix = req.query.fname;
    let now = new Date().toLocaleTimeString();
    fs.writeFile(`./rec/${fname_prefix}.txt`, now, { flag: "a" }, err => { console.log(err) });
    res.send("get time")
})

app.get("/get_qw", (req, res) => {
    res.send(qwList)
})

app.post('/record', (req, res) => {
    const fname_prefix = req.body.f + req.body.i + req.body.o
    res.render('record', { fname_prefix: fname_prefix || 'noname', chunk_time: 1000 })
})

app.get("/start_interview", (req, res) => {
    res.render("index")
})

io.on('connection', socket => {
    socket.on('recorded-chunk', (data) => {
        var fileStream = fs.createWriteStream(`./rec/${data.filename}.webm`, { flags: 'a' });
        fileStream.write(Buffer.from(new Uint8Array(data.chunk)));
        console.log('chunk recieved');
    })
})

server.listen(port, host, () => {
    console.log(`server running at link: https://${host}:${port}`);
    console.log(`record video page: https://${host}:${port}/record`);
})
