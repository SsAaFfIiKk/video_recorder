const socket = io('https://teachingquality.onti.actcognitive.org', { path: '/socket.io' });
const qw_url = "https://teachingquality.onti.actcognitive.org/get_qw"

const videoElement = document.getElementById('main-video');
const constraints = { video: true, audio: true };
const currentTimestamp = new Date().valueOf().toString();

function getVideoStream() {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => { 
                videoElement.srcObject = stream;
                videoElement.addEventListener('loadedmetadata', () => {
                    videoElement.play();
                    recordVideo(stream);
                });
            })
            .catch((error) => {
                console.log(error);
                alert('Устройство видеозаписи недоступно');
            });
    }
}

function recordVideo (stream) {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start(CHUNK_TIME);

    mediaRecorder.ondataavailable = function(e) {
        if (e.data && e.data.size > 0) {
            const filename = FNAME_PREFIX;
            socket.emit('recorded-chunk', {
                filename: filename,
                chunk: e.data
            });
        }
    }
}

fetch(qw_url)
.then(res => res.json())
.then(out => {qwList = out; create()})

let count = 0
let qw = document.getElementById("question")
let bt = document.getElementById("nextQw")

function create(){
    qw.innerHTML = qwList[count]
    bt.innerHTML = "Cледующий вопрос ->"
}

function next(){
    sendTimestamp();
    count++;
    qw.innerHTML = qwList[count];

    if (count == qwList.length-1){
        bt.innerHTML = "Закончить интервью"
        bt.onclick = stopRecording;
    }
}

function stopRecording(){
    sendTimestamp();
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();
      
    tracks.forEach(function(track) {
        track.stop();
    });
      
    videoElement.srcObject = null;
    document.getElementById("hidden1").style.display = "none";
    document.getElementById("status").className = "end"
    document.getElementById("status").innerHTML = "Интервью закончено, спасибо"
}

function sendTimestamp() {
    let time_url = "https://teachingquality.onti.actcognitive.org/timestamp?fname=";
    let req = fetch(time_url + FNAME_PREFIX)
}
