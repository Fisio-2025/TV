import './components/CameraView.js';
import './components/StatBox.js';
import './components/ExerciseListItem.js';
import './components/ExerciseSidebar.js';

const configOverlay = document.getElementById('config-overlay');
const mainUi = document.getElementById('main-ui');
const disconnectBtn = document.getElementById('disconnect-btn');
const statusOverlay = document.getElementById('status-overlay');
const qrContainer = document.getElementById('qr-container');
const qrImage = document.getElementById('qr-image');
const roomIdDisplay = document.getElementById('room-id-display');

let peer = null;
let activeConnection = null;
let activeCall = null;

function generateRandomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function initPeerSession() {
    const currentId = generateRandomId();

    peer = new Peer(currentId, {
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });

    peer.on('open', (id) => {
        roomIdDisplay.innerText = id;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${id}&color=0f172a&bgcolor=ffffff`;
        qrImage.src = qrUrl;
        qrImage.onload = () => qrContainer.classList.remove('hidden');
    });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            peer.destroy();
            setTimeout(initPeerSession, 300);
            return;
        }
        showStatus("Błąd: " + err.type);
    });

    peer.on('call', (call) => {
        activeCall = call;
        call.answer();
        call.on('stream', (remoteStream) => {
            const cameraViews = document.querySelectorAll('camera-view');
            cameraViews.forEach(view => {
                if (view.hasAttribute('ismain')) {
                    const video = view.shadowRoot ? view.shadowRoot.querySelector('video') : view.querySelector('video');
                    if (video) video.srcObject = remoteStream;
                }
            });
        });
        call.on('close', resetUI);
    });

    peer.on('connection', (conn) => {
        activeConnection = conn;
        
        configOverlay.classList.add('opacity-0');
        setTimeout(() => {
            configOverlay.classList.add('hidden');
            mainUi.classList.remove('hidden');
            setTimeout(() => mainUi.classList.remove('opacity-0'), 50);
        }, 500);

        conn.on('data', (data) => {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            handleIncomingData(parsedData);
        });
        conn.on('close', resetUI);
    });

    peer.on('disconnected', () => {
        if (peer && !peer.destroyed) {
            peer.reconnect();
        }
    });
}

disconnectBtn.addEventListener('click', resetUI);

function handleIncomingData(data) {
    console.log("Otrzymano dane JSON:", data);

    if (data.reps !== undefined) {
        const sidebar = document.querySelector('exercise-sidebar');
        if (sidebar && sidebar.shadowRoot) {
            const repEl = sidebar.shadowRoot.getElementById('stat-powtórzenia');
            if (repEl) repEl.innerText = data.reps;
        }
        
        const directRepEl = document.getElementById('stat-powtórzenia');
        if (directRepEl) directRepEl.innerText = data.reps;
    }
    
    if (data.title !== undefined) {
        const titleEl = document.getElementById('ui-title');
        if (titleEl) titleEl.innerText = data.title;

        const sidebar = document.querySelector('exercise-sidebar');
        if (sidebar && sidebar.shadowRoot) {
            const sidebarTitle = sidebar.shadowRoot.getElementById('ui-title');
            if (sidebarTitle) sidebarTitle.innerText = data.title;
        }
    }
}

function resetUI() {
    if (activeCall) activeCall.close();
    if (activeConnection) activeConnection.close();
    if (peer) {
        peer.destroy();
        peer = null;
    }

    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
        if (v.srcObject) {
            v.srcObject.getTracks().forEach(t => t.stop());
            v.srcObject = null;
        }
    });

    mainUi.classList.add('opacity-0');
    setTimeout(() => {
        mainUi.classList.add('hidden');
        configOverlay.classList.remove('hidden');
        qrContainer.classList.add('hidden');
        roomIdDisplay.innerText = '';
        setTimeout(() => configOverlay.classList.remove('opacity-0'), 50);
        initPeerSession();
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

initPeerSession();