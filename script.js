function updateTime() {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    clockEl.textContent = timeString;

    const options = { weekday: 'long', month: 'short', day: '2-digit' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
}

let currentDate = new Date();
let viewMode = 'month';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function initCalendar() {
    renderCalendar();

    document.getElementById('btn-prev').addEventListener('click', () => changeDate(-1));
    document.getElementById('btn-next').addEventListener('click', () => changeDate(1));
    document.getElementById('btn-view-switch').addEventListener('click', toggleView);
    document.getElementById('btn-today').addEventListener('click', goToToday);
}

function goToToday() {
    currentDate = new Date();
    viewMode = 'month';
    document.getElementById('btn-view-switch').textContent = 'YEAR';
    renderCalendar();
}

function toggleView() {
    if (viewMode === 'month') {
        viewMode = 'year';
        document.getElementById('btn-view-switch').textContent = 'MONTH';
    } else {
        viewMode = 'month';
        document.getElementById('btn-view-switch').textContent = 'YEAR';
    }
    renderCalendar();
}

function changeDate(delta) {
    if (viewMode === 'month') {
        currentDate.setMonth(currentDate.getMonth() + delta);
    } else {
        currentDate.setFullYear(currentDate.getFullYear() + delta);
    }
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-title');
    grid.innerHTML = '';

    if (viewMode === 'month') {
        renderMonthView(grid, title);
    } else {
        renderYearView(grid, title);
    }
}

function renderMonthView(grid, title) {
    grid.className = 'calendar-grid';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    title.textContent = `${months[month]} ${year}`;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day-name';
        div.textContent = day;
        grid.appendChild(div);
    });

    let firstDay = new Date(year, month, 1).getDay();
    if (firstDay === 0) firstDay = 7;
    firstDay -= 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        const div = document.createElement('div');
        div.className = 'day-cell other-month';
        div.textContent = prevMonthDays - i;
        grid.appendChild(div);
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'day-cell';
        div.textContent = i;

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            div.classList.add('current-day');
        }
        grid.appendChild(div);
    }
}

function renderYearView(grid, title) {
    grid.className = 'calendar-grid year-view';
    const year = currentDate.getFullYear();
    title.textContent = `${year}`;

    const today = new Date();
    months.forEach((m, index) => {
        const div = document.createElement('div');
        div.className = 'month-cell';
        div.textContent = m.substring(0, 3);

        if (index === today.getMonth() && year === today.getFullYear()) {
            div.classList.add('current-month');
        }

        div.addEventListener('click', () => {
            currentDate.setMonth(index);
            viewMode = 'month';
            document.getElementById('btn-view-switch').textContent = 'YEAR';
            renderCalendar();
        });

        grid.appendChild(div);
    });
}

setInterval(updateTime, 1000);
updateTime();
initCalendar();
