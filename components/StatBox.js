export default class StatBox extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute('label') || '';
        const current = this.getAttribute('current') || '0';
        const total = this.getAttribute('total') || '0';
        const progress = (Number(current) / Number(total)) * 100;

        this.className = "flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm";
        this.innerHTML = `
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">${label}</div>
            <div class="flex items-baseline gap-1">
                <span class="text-4xl font-black text-[#4361EE]" id="stat-${label.toLowerCase()}">${current}</span>
                <span class="text-slate-300 font-bold text-lg">/${total}</span>
            </div>
            <div class="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                <div class="bg-[#4361EE] h-1 rounded-full" style="width: ${progress}%" id="stat-progress-${label.toLowerCase()}"></div>
            </div>
        `;
    }
}
customElements.define('stat-box', StatBox);