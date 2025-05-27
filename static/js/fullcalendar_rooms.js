document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting rooms calendar initialization...');
    
    // Get calendar element
    let calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('Calendar element not found');
        return;
    }
    console.log('Calendar element found');
    
    // Get site prefix from Django
    let prefixMeta = document.querySelector('meta[name="site-prefix"]');
    let sitePrefix = prefixMeta ? prefixMeta.getAttribute('content') : '';
    console.log('Using site prefix:', sitePrefix);
    
    // Initialize FullCalendar
    let calendar = new FullCalendar.Calendar(calendarEl, {
        // Basic configuration
        initialView: 'timeGridWeek',
        nowIndicator: true,
        locale: 'fr',
        hiddenDays: [0],
        weekNumbers: true,
        weekText: 'Semaine',
        allDaySlot: false,
        businessHours: [
            {
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '08:00',
                endTime: '18:00'
            },
            {
                daysOfWeek: [6],
                startTime: '08:00',
                endTime: '12:30'
            }
        ],
        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        slotDuration: "00:30:00",
        height: "auto",
        selectable: true,

        // Button configurations
        buttonText: {
            today: 'Aujourd\'hui',
            timeGridWeek: 'Semaine',
            timeGridDay: 'Jour'
        },
        headerToolbar: {
            left: 'prev today rooms,equipments',
            center: 'title',
            right: 'timeGridWeek,timeGridDay next'
        },
        customButtons: {
            rooms: {
                text: 'Salles',
                click: function() {
                    window.location.href = `${sitePrefix}/`;
                }
            },
            equipments: {
                text: 'Équipements',
                click: function() {
                    window.location.href = `${sitePrefix}/equipments/calendar/`;
                }
            }
        },

        // Event sources
        eventSources: [
            {
                url: `${sitePrefix}/calendar/holiday.ics`,
                format: 'ics',
                color: '#f44336',
                textColor: '#fff',
                className: 'event-holiday'
            },
            {
                url: `${sitePrefix}/calendar/bookedrooms.ics`,
                format: 'ics'
            }
        ],

        // Event handling
        select: function(info) {
            const addButton = document.querySelector('button.d-none.modalAdd');
            addButton.click();
            document.getElementById('id_date').value = moment(info.start).format("DD/MM/YYYY");
            document.getElementById('id_startTime').value = moment(info.start).format("HH:mm");
            document.getElementById('id_endTime').value = moment(info.end).format("HH:mm");
        },

        // Event display
        eventDidMount: function(info) {
            console.log('Event mounted:', info.event.title);
            let eventData;
            try {
                eventData = JSON.parse(info.event.title);
            } catch (e) {
                console.error('Failed to parse event data:', e);
                return;
            }

            let classNames = [];
            if (eventData.holiday === "false") {
                const statusMap = {
                    pending: 'pending',
                    validated: 'validated'
                };
                const labMap = {
                    'CReSTIC': 'crestic',
                    'Lab-i*': 'labi',
                    'LICIIS': 'liciis',
                    'Autre': 'autre'
                };

                const status = statusMap[eventData.status];
                const lab = labMap[eventData.labo];
                if (status && lab) {
                    classNames.push(`event-${status}-${lab}`);
                }
            } else {
                classNames.push('event-holiday');
            }
            info.el.classList.add(...classNames);
        },

        eventContent: function(arg) {
            let eventDetails = document.createElement('span');
            let eventData;
            try {
                eventData = JSON.parse(arg.event.title);
            } catch (e) {
                console.error('Failed to parse event data:', e);
                return { html: arg.event.title };
            }

            const start = moment(arg.event.start).format("HH:mm");
            const end = moment(arg.event.end).format("HH:mm");

            if (eventData.holiday === "false") {
                eventDetails.innerHTML = `
                    <p class="event-details">${start} - ${end}&ensp;❘&ensp;${eventData.nom}</p>
                    <p class="event-labo">${eventData.labo}</p>
                    <p class="event-motif">${eventData.motif}</p>`;
            } else {
                eventDetails.innerHTML = `<p class="event-details">${eventData.nom}</p>`;
            }
            return { domNodes: [eventDetails] };
        }
    });

    calendar.render();

    // Initialize button states
    const btnWeek = document.querySelector('.fc-timeGridWeek-button');
    const btnDay = document.querySelector('.fc-timeGridDay-button');
    if (btnWeek && btnDay) {
        btnWeek.disabled = true;
        btnWeek.addEventListener('click', function() {
            btnWeek.disabled = true;
            btnDay.disabled = false;
        });
        btnDay.addEventListener('click', function() {
            btnDay.disabled = true;
            btnWeek.disabled = false;
        });
    }

    // Handle form reset
    const btnCloseAdd = document.getElementById('btnCloseAdd');
    const eventForm = document.getElementById('eventForm');
    if (btnCloseAdd && eventForm) {
        btnCloseAdd.addEventListener('click', function() {
            eventForm.reset();
        });
    }

    // Handle form errors
    const formError = document.getElementById('error-form');
    if (formError) {
        const addButton = document.querySelector('button.d-none.modalAdd');
        if (addButton) {
            addButton.click();
        }
    }
});
