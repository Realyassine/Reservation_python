from django.urls import path  # Importe la fonction path pour définir des chemins d'URL
from .views import *  # Importe toutes les fonctions de vue depuis le module actuel

urlpatterns = [
    # URL pour exporter les vacances au format iCalendar
    path('calendarHoliday.ics',
         export_holiday_ics, name='holiday.ics'),
    # Alternative URL path that might be more accessible
    path('holiday.ics',
         export_holiday_ics, name='holiday_alt.ics'),
    # URL pour exporter les réservations de salles au format iCalendar
    path('calendarBookedroom.ics',
         export_bookedrooms_ics, name='bookedrooms.ics'),
    # Alternative URL path for room bookings
    path('bookedrooms.ics',
         export_bookedrooms_ics, name='bookedrooms_alt.ics'),
    path('calendarBookedequipments.ics',
         export_bookedequipments_ics, name='bookedequipments.ics'),
    # Alternative URL path for equipment bookings
    path('bookedequipments.ics',
         export_bookedequipments_ics, name='bookedequipments_alt.ics'),
    # URL pour exporter les données vers Excel
    path('excelRoom',
         export_to_excel_room, name='excelRoom'),
    path('excelEquipment',
         export_to_excel_equipment, name='excelEquipment'),
    path('reservationSalles.ics',
         export_bookedroomsNOJSON_ics, name='reservation salles'),
    path('reservationEquipements.ics',
         export_bookedequipmentsNOJSON_ics, name='reservation equipements')
]
