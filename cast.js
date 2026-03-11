import './components/CameraView.js';
import './components/StatBox.js';
import './components/ExerciseListItem.js';
import './components/ExerciseSidebar.js';

const configOverlay = document.getElementById('config-overlay');
const mainUi = document.getElementById('main-ui');
const startBtn = document.getElementById('start-receiver-btn');
const peerIdInput = document.getElementById('peer-id-input');

let peer = null;

startBtn.addEventListener('click', () => {
    const id = peerIdInput.value.trim();
    if (!id) return alert("Wprowadź ID");

    peer = new Peer(id);

    peer.on('open', (assignedId) => {
        configOverlay.classList.add('hidden');
        mainUi.classList.remove('hidden');
        setTimeout(() => mainUi.classList.remove('opacity-20'), 50);
    });

    peer.on('call', (call) => {
        call.answer();
        call.on('stream', (remoteStream) => {
            const videoEl = document.getElementById('remote-video');
            if (videoEl) {
                videoEl.srcObject = remoteStream;
            }
        });
    });

    peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            try {
                const parsedData = JSON.parse(data);
                handleIncomingData(parsedData);
            } catch (e) {
                console.error(e);
            }
        });
    });

    peer.on('error', (err) => {
        alert(err.type);
    });
});

function handleIncomingData(data) {
    if (data.reps !== undefined) {
        const repEl = document.getElementById('stat-powtórzenia');
        if (repEl) repEl.innerText = data.reps;
    }
    if (data.title !== undefined) {
        const titleEl = document.getElementById('ui-title');
        if (titleEl) titleEl.innerText = data.title;
    }
}