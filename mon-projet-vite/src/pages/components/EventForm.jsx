// src/components/EventForm.jsx
import React, { useState } from 'react';

const EventForm = ({ addEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && description && date) {
            addEvent({ title, description, date });
            setTitle('');
            setDescription('');
            setDate('');
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Ajouter un nouvel événement</h2>
            <div>
                <label>Date:</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div>
                <label>Titre:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div>
                <label>Description:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <button type="submit">Ajouter l'événement</button>
        </form>
    );
};

export default EventForm;
