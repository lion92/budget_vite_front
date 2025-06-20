// src/components/CalendarView.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';

const CalendarView = ({ events }) => {
    const [date, setDate] = useState(new Date());

    // Filtre les événements pour la date sélectionnée
    const selectedDateEvents = events.filter(
        (event) =>
            new Date(event.date).toDateString() === date.toDateString()
    );

    return (
        <div className="container">
            <Calendar onChange={setDate} value={date} />
            <div>
                <h2 style={{fontSize:15}}>Événements pour {date.toDateString()}</h2>
                {selectedDateEvents.length > 0 ? (
                    <ul>
                        {selectedDateEvents.map((event, index) => (
                            <li key={index}>
                                <strong>{event.title}</strong>: {event.description}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun événement pour cette date.</p>
                )}
            </div>
        </div>
    );
};

export default CalendarView;
