import './components/CameraView.js';
import './components/StatBox.js';
import './components/ExerciseListItem.js';
import './components/ExerciseSidebar.js';

const configOverlay = document.getElementById('config-overlay');
const mainUi = document.getElementById('main-ui');
const startBtn = document.getElementById('start-receiver-btn');
const peerIdInput = document.getElementById('peer-id-input');
const disconnectBtn = document.getElementById('disconnect-btn');
const statusOverlay = document.getElementById('status-overlay');

let peer = null;
let activeConnection = null;
let activeCall = null;

startBtn.addEventListener('click', () => {
    const id = peerIdInput.value.trim();
    if (!id) {
        showStatus("Wprowadź ID ekranu");
        return;
    }

    startBtn.disabled = true;
    startBtn.innerText = "ŁĄCZENIE...";

    peer = new Peer(id, {
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });

    peer.on('open', () => {
        configOverlay.classList.add('opacity-0');
        setTimeout(() => {
            configOverlay.classList.add('hidden');
            mainUi.classList.remove('hidden');
            setTimeout(() => mainUi.classList.remove('opacity-0'), 50);
        }, 500);
        startBtn.disabled = false;
        startBtn.innerText = "URUCHOM EKRAN";
    });

    peer.on('call', (call) => {
        activeCall = call;
        call.answer();
        call.on('stream', (remoteStream) => {
            const videoEl = document.getElementById('remote-video');
            if (videoEl) videoEl.srcObject = remoteStream;
        });
        call.on('close', resetUI);
    });

    peer.on('connection', (conn) => {
        activeConnection = conn;
        conn.on('data', (data) => {
            try {
                const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                handleIncomingData(parsedData);
            } catch (e) {
                console.error("Błąd parsowania danych:", e);
            }
        });
        conn.on('close', resetUI);
    });

    peer.on('disconnected', () => {
        if (peer && !peer.destroyed) {
            showStatus("Odnawianie połączenia...");
            peer.reconnect();
        }
    });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            showStatus("ID jest już zajęte. Wybierz inne.");
            peer = null;
            startBtn.disabled = false;
            startBtn.innerText = "URUCHOM EKRAN";
            return;
        }
        showStatus("Błąd: " + err.type);
        resetUI();
    });
});

disconnectBtn.addEventListener('click', resetUI);

function handleIncomingData(data) {
    console.log("Odebrano JSON z nadajnika:", data);

    if (data.reps !== undefined) {
        const repEl = document.getElementById('stat-powtórzenia');
        if (repEl) repEl.innerText = data.reps;
    }
    if (data.title !== undefined) {
        const titleEl = document.getElementById('ui-title');
        if (titleEl) titleEl.innerText = data.title;
    }
}

function resetUI() {
    if (activeCall) activeCall.close();
    if (activeConnection) activeConnection.close();
    if (peer) {
        peer.destroy();
        peer = null;
    }

    const videoEl = document.getElementById('remote-video');
    if (videoEl && videoEl.srcObject) {
        videoEl.srcObject.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
    }

    mainUi.classList.add('opacity-0');
    setTimeout(() => {
        mainUi.classList.add('hidden');
        configOverlay.classList.remove('hidden');
        setTimeout(() => configOverlay.classList.remove('opacity-0'), 50);
        startBtn.disabled = false;
        startBtn.innerText = "URUCHOM EKRAN";
    }, 500);

    activeConnection = null;
    activeCall = null;
}

function showStatus(text) {
    statusOverlay.innerText = text;
    statusOverlay.classList.remove('opacity-0');
    setTimeout(() => statusOverlay.classList.add('opacity-0'), 4000);
}

window.addEventListener('beforeunload', () => {
    if (peer) peer.destroy();
});