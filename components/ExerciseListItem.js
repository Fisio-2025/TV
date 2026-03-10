export default class ExerciseListItem extends HTMLElement {
    connectedCallback() {
        const number = this.getAttribute('number');
        const name = this.getAttribute('name');
        const details = this.getAttribute('details');
        const active = this.hasAttribute('active');
        const type = this.getAttribute('type') || 'Isotonic';

        const typeColors = {
            'Isotonic': 'text-blue-700 bg-blue-50',
            'Isometric': 'text-orange-700 bg-orange-50'
        };

        this.innerHTML = `
            <div class="flex items-center justify-between p-3 rounded-xl transition-colors ${active ? 'bg-[#EEF2FF] border border-[#E0E7FF]' : 'bg-transparent border border-transparent'}">
                <div class="flex items-center gap-4">
                    <span class="font-black w-4 text-center text-sm ${active ? 'text-[#4361EE]' : 'text-slate-300'}">${number}</span>
                    <div class="flex flex-col">
                        <span class="font-extrabold text-sm ${active ? 'text-slate-800' : 'text-slate-500'}">${name}</span>
                        <span class="text-slate-400 text-xs font-medium">${details}</span>
                    </div>
                </div>
                <span class="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${typeColors[type] || 'text-purple-700 bg-purple-50'}">
                    ${type}
                </span>
            </div>
        `;
    }
}
customElements.define('exercise-item', ExerciseListItem);