const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
}); // auto generate id

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then (stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);

        const video = document.createElement('video');

        call.on('stream', userVideStream => {
            addVideoStream(video, userVideStream);
        })
    })

    socket.on('user-connected', userId => {
        // console.log('user connected', userId);
        connectToNewUser(userId, stream);
    })
})

myPeer.on('open', userId => {
    socket.emit('join-room', ROOM_ID, userId);
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideStream => {
        addVideoStream(video, userVideStream);
    })
    call.on('close', ()=>{
        video.remove();
    })
}
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}