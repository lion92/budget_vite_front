// src/App.js
import React, { useState, useEffect } from 'react';
import './css/agenda.css'
import EventForm from "./EventForm.jsx";

const Agenda = () => {
    const [events, setEvents] = useState([]);
    const [saveMessage, setSaveMessage] = useState('');

    // Charger les événements depuis le localStorage
    useEffect(() => {
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    // Fonction pour sauvegarder les événements dans le localStorage
    const saveEventsToLocalStorage = (events) => {
        localStorage.setItem('events', JSON.stringify(events));
        setSaveMessage('Données sauvegardées dans le localStorage !');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    // Fonction pour ajouter un nouvel événement
    const addEvent = (event) => {
        const newEvents = [...events, event];
        setEvents(newEvents);
        saveEventsToLocalStorage(newEvents);
    };

    // Fonction pour supprimer un événement
    const deleteEvent = (index) => {
        const newEvents = events.filter((_, i) => i !== index);
        setEvents(newEvents);
        saveEventsToLocalStorage(newEvents);
    };

    return (
        <div className="App">
            <h1>Agenda React</h1>
            {saveMessage && <p>{saveMessage}</p>}
            <EventForm addEvent={addEvent} />
            <div className="event-list">
                <h2>Tous les événements</h2>
                {events.length > 0 ? (
                    <ul>
                        {events.map((event, index) => (
                            <li key={index}>
                                <strong>{event.title}</strong>: {event.description}:
                                :{event.date}
                                <button onClick={() => deleteEvent(index)}>Supprimer</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun événement disponible.</p>
                )}
            </div>
        </div>
    );
};

export default Agenda
