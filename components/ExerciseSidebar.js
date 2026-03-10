export default class ExerciseSidebar extends HTMLElement {
    connectedCallback() {
        this.className = "block h-full";
        this.render();
    }

    render() {
        const exercises = [
            { id: 1, number: 1, name: 'Push-ups', details: '3 powtórzenia', active: true, type: 'Isotonic' },
            { id: 2, number: 2, name: 'Sit-ups', details: '5 powtórzenia', active: false, type: 'Isotonic' },
            { id: 3, number: 3, name: 'Squats', details: '7 powtórzenia', active: false, type: 'Isotonic' }
        ];

        this.innerHTML = `
            <div class="bg-[#F8FAFC] rounded-xl flex flex-col p-6 shadow-lg h-full">
                <div class="mb-8">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">PROGRAM TRENINGOWY</p>
                    <h1 class="text-2xl font-extrabold text-slate-800 mb-4">Daily Routine</h1>
                    <div class="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Ćwiczenia 1 / 3</span>
                        <span class="text-blue-600">33%</span>
                    </div>
                    <div class="w-full bg-blue-100 rounded-full h-1">
                        <div class="bg-blue-600 h-1 rounded-full" style="width: 33%"></div>
                    </div>
                </div>

                <div class="mb-8">
                    <div class="flex items-center gap-3 mb-4">
                        <h2 class="text-xl font-extrabold text-slate-800">Push-ups</h2>
                        <span class="text-[10px] text-blue-700 bg-blue-100 px-2 py-1 rounded font-bold uppercase">Isotonic</span>
                    </div>
                    <div class="flex gap-4">
                        <stat-box label="POWTÓRZENIA" current="0" total="12"></stat-box>
                        <stat-box label="SERIE" current="1" total="3"></stat-box>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto mb-6 flex flex-col gap-1 pr-2">
                    ${exercises.map(e => `
                        <exercise-item 
                            number="${e.number}" 
                            name="${e.name}" 
                            details="${e.details}" 
                            type="${e.type}" 
                            ${e.active ? 'active' : ''}>
                        </exercise-item>
                    `).join('')}
                </div>

                <div class="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-200">
                    <button class="w-full bg-[#4361EE] hover:bg-[#3A56D4] transition-colors text-white rounded-xl py-4 font-bold flex justify-center items-center gap-2 shadow-md">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        ROZPOCZNIJ
                    </button>
                </div>
            </div>
        `;
    }
}
customElements.define('exercise-sidebar', ExerciseSidebar);