export default class CameraView extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || '';
        const status = this.getAttribute('status') || '';
        const time = this.getAttribute('time') || '';
        const isMain = this.getAttribute('ismain') === 'true';

        this.className = "flex-1 bg-[#E2E8F0] rounded-xl relative overflow-hidden border border-slate-300";
        
        let content = `
            <div class="absolute top-4 left-4 flex items-center gap-2 text-slate-400 font-bold text-sm tracking-wider z-10">${status}</div>
            ${time ? `<div class="absolute top-4 right-4 text-slate-400 font-mono text-sm font-bold z-10" id="ui-time">${time}</div>` : ''}
            <div class="absolute bottom-4 left-4 text-slate-400 font-bold text-sm tracking-wider z-10">${title}</div>
        `;

        if (isMain) {
            content += `<video id="remote-video" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>`;
        } else {
            content += `
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="text-slate-400 opacity-50">
                    <svg width="48" height="120" viewBox="0 0 48 120" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="24" cy="16" r="10" fill="currentColor"/>
                        <line x1="24" y1="26" x2="24" y2="70" />
                        <line x1="24" y1="40" x2="4" y2="40" />
                        <line x1="24" y1="40" x2="44" y2="40" />
                        <line x1="24" y1="70" x2="14" y2="110" />
                        <line x1="24" y1="70" x2="34" y2="110" />
                    </svg>
                </div>
            </div>`;
        }

        this.innerHTML = content;
    }
}
customElements.define('camera-view', CameraView);