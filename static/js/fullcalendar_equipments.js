document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting calendar initialization...');
    
    // Get calendar element
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('Calendar element not found');
        return;
    }
    console.log('Calendar element found');
    
    // Get site prefix from Django
    const sitePrefix = document.querySelector('meta[name="site-prefix"]').getAttribute('content') || '';
    console.log('Using site prefix:', sitePrefix);
    
    // Initialize FullCalendar
    try {
        // Création d'une instance du calendrier FullCalendar
        console.log('Creating calendar instance...');
        let calendarEquipment = new FullCalendar.Calendar(calendarEl, {
            // Basic configuration
            baseUrl: sitePrefix,
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
                    text: 'Équipements'
                }
            },
            viewDidMount: function() {
                document.querySelector('.fc-equipments-button').setAttribute('disabled', 'true');
            },
            views: {
                timeGridWeek: {
                    buttonText: 'Semaine',
                    didMount: function(view) {
                        document.querySelector('.fc-timeGridWeek-button').classList.add('disable');
                        document.querySelector('.fc-timeGridDay-button').classList.remove('disable');
                    }
                },
                timeGridDay: {
                    buttonText: 'Jour',
                    didMount: function(view) {
                        document.querySelector('.fc-timeGridDay-button').classList.add('disable');
                        document.querySelector('.fc-timeGridWeek-button').classList.remove('disable');
                    }
                }
            },
            eventSources: [
                {
                    url: `${sitePrefix}/calendar/calendarHoliday.ics`,
                    format: 'ics',
                    color: '#f44336',
                    textColor: '#fff',
                    className: 'event-holiday',
                    success: function(content) {
                        console.log('ICS holiday loaded successfully!', content);
                    },
                    failure: function(error) {
                        console.error('Failed to load ICS holiday:', error);
                    }
                },
                {
                    url: `${sitePrefix}/calendar/calendarBookedequipments.ics`,
                    format: 'ics',
                    success: function(content) {
                        console.log('ICS booked equipment loaded successfully!', content);
                    },
                    failure: function(error) {
                        console.error('Failed to load ICS booked equipment:', error);
                    }
                }
            ],
            eventClick: function(info) {
                let start = moment(info.event.start).format("HH:mm");
                let end = moment(info.event.end).format("HH:mm");
                let eventTitle = document.getElementById('eventTitle');
                let eventDescription = document.getElementById('eventDescription');
                const detailsButton = document.querySelector('button.d-none.modalDetails');
                detailsButton.click();
                
                let eventData = JSON.parse(info.event.title);
                let eventDetailsButtons = document.querySelector("div.eventDetailsButtons");
                
                if (eventData.holiday === "false") {
                    let statut;
                    if (eventData.status === "pending") {
                        statut = "En attente";
                    }
                    else if (eventData.status === "canceled") {
                        statut = "Annulé";
                    }
                    else if (eventData.status === "loaned") {
                        statut = "Prêté";
                    }
                    else if (eventData.status === "back") {
                        statut = "Rendu";
                    }
                    else if (eventData.status === "late") {
                        statut = "En retard";
                    }
                    
                    eventTitle.innerHTML = `
                        ${start} - ${end}&ensp;❘&ensp;
                        <span class="modal-detail-title">${eventData.nom}</span>`;
                    eventDescription.innerHTML = `<p class="modal-description">${eventData.motif}</p>`;
                    eventDescription.innerHTML += `
                        <ul class="list-group modal-list">
                            <li class="list-group-item d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold">Laboratoire</div>
                                    ${eventData.labo}
                                </div>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold">Statut</div>
                                    ${statut}
                                </div>
                            </li>
                        </ul>
                    `;
                    
                    if (eventData.holiday === "false") {
                        eventDetailsButtons.innerHTML = `
                            <a id="ancreEdit" class="btn btn-primary button-style" href="${sitePrefix}/equipmentbooking/${eventData.id}/edit_equipment/">Modifier</a>
                            <a id="ancreDelete" class="btn btn-danger card-link button-style button-red" href="${sitePrefix}/equipmentbooking/${eventData.id}/delete_equipment/">Annuler</a>
                        `;
                    }
                } else {
                    eventTitle.innerText = "Jour férié";
                    eventDetailsButtons.innerHTML = null;
                    eventDescription.innerHTML = `<p class="modal-description">${eventData.nom}</p>`;
                }
            },
            select: function(info) {
                const addButton = document.querySelector('button.d-none.modalAdd');
                addButton.click();
                document.getElementById('id_date').value = moment(info.start).format("DD/MM/YYYY");
                document.getElementById('id_startTime').value = moment(info.start).format("HH:mm");
                document.getElementById('id_endTime').value = moment(info.end).format("HH:mm");
            },
            selectAllow: function(selectInfo) {
                if (selectInfo.start.getDay() === 6) {
                    let startTime = new Date(selectInfo.start.getFullYear(), selectInfo.start.getMonth(), selectInfo.start.getDate(), 8, 0);
                    let endTime = new Date(selectInfo.start.getFullYear(), selectInfo.start.getMonth(), selectInfo.start.getDate(), 12, 30);
                    return selectInfo.start >= startTime && selectInfo.end <= endTime;
                }
                return true;
            },
            eventDidMount: function(info) {
                let classNames = [];
                let eventData = JSON.parse(info.event.title);
                if (eventData.holiday === "false") {
                    if (eventData.status === 'pending') {
                        switch (eventData.labo) {
                            case 'CReSTIC':
                                classNames.push('event-pending-crestic');
                                break;
                            case 'Lab-i*':
                                classNames.push('event-pending-labi');
                                break;
                            case 'LICIIS':
                                classNames.push('event-pending-liciis');
                                break;
                            case 'Autre':
                                classNames.push('event-pending-autre');
                                break;
                        }
                    } else if (eventData.status === 'loaned') {
                        switch (eventData.labo) {
                            case 'CReSTIC':
                                classNames.push('event-validated-crestic');
                                break;
                            case 'Lab-i*':
                                classNames.push('event-validated-labi');
                                break;
                            case 'LICIIS':
                                classNames.push('event-validated-liciis');
                                break;
                            case 'Autre':
                                classNames.push('event-validated-autre');
                                break;
                        }
                    }
                } else {
                    classNames.push('event-holiday');
                }
                info.el.classList.add(...classNames);
            },
            eventContent: function(arg) {
                let start = moment(arg.event.start).format("HH:mm");
                let end = moment(arg.event.end).format("HH:mm");
                let eventDetails = document.createElement('span');
                let eventData = JSON.parse(arg.event.title);
                if (eventData.holiday === "false") {
                    eventDetails.innerHTML = `<p class="event-details">${start} - ${end}&ensp;❘&ensp;${eventData.nom}</p>`;
                    eventDetails.innerHTML += `<p class="event-labo">${eventData.labo}</p>`;
                    eventDetails.innerHTML += `<p class="event-motif">${eventData.motif}</p>`;
                } else {
                    eventDetails.innerHTML = `<p class="event-details">${eventData.nom}</p>`;
                }
                let arrayOfDomNodes = [eventDetails];
                return { domNodes: arrayOfDomNodes };
            }
        });
        
        calendarEquipment.render();

        // Setup modal handlers
        let btnCloseAdd = document.getElementById('btnCloseAdd');
        let eventForm = document.getElementById('eventForm');
        btnCloseAdd.addEventListener('click', function() {
            eventForm.reset();
        });

        // Check for form errors
        const formError = document.getElementById('error-form');
        if (formError) {
            const addButton = document.querySelector('button.d-none.modalAdd');
            addButton.click();
        }

        // Setup navigation button handlers
        let btnWeek = document.querySelector('.fc-timeGridWeek-button');
        let btnDay = document.querySelector('.fc-timeGridDay-button');

        // Disable week button by default
        btnWeek.disabled = true;

        btnWeek.addEventListener('click', function() {
            btnWeek.disabled = true;
            btnDay.disabled = false;
        });

        btnDay.addEventListener('click', function() {
            btnDay.disabled = true;
            btnWeek.disabled = false;
        });

    } catch (error) {
        console.error('Error initializing calendar:', error);
    }
});
