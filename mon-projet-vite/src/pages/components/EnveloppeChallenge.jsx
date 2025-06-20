import React, { useState, useEffect } from 'react';

const EnvelopeChallenge = () => {
    const [challenges, setChallenges] = useState(() => {
        const saved = localStorage.getItem('challenges');
        return saved ? JSON.parse(saved) : [];
    });

    const [newChallenge, setNewChallenge] = useState({
        name: '',
        total: '',
        cases: '',
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [challengeToDelete, setChallengeToDelete] = useState(null);

    useEffect(() => {
        localStorage.setItem('challenges', JSON.stringify(challenges));
    }, [challenges]);

    const handleAddChallenge = () => {
        const { name, total, cases } = newChallenge;
        if (!name || !total || !cases) return;

        const amountPerCase = Math.floor(total / cases);
        const newCases = Array.from({ length: cases }, (_, i) => ({
            id: i,
            amount: amountPerCase,
            scratched: false,
        }));

        const challenge = {
            id: Date.now(),
            name,
            total,
            cases: newCases,
        };

        setChallenges([...challenges, challenge]);
        setNewChallenge({ name: '', total: '', cases: '' });
    };

    const toggleScratch = (challengeId, caseId) => {
        setChallenges((prev) =>
            prev.map((ch) =>
                ch.id === challengeId
                    ? {
                        ...ch,
                        cases: ch.cases.map((c) =>
                            c.id === caseId ? { ...c, scratched: !c.scratched } : c
                        ),
                    }
                    : ch
            )
        );
    };

    const confirmDelete = (challengeId) => {
        setShowConfirm(true);
        setChallengeToDelete(challengeId);
    };

    const handleDeleteConfirmed = () => {
        setChallenges((prev) => prev.filter((c) => c.id !== challengeToDelete));
        setShowConfirm(false);
        setChallengeToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setChallengeToDelete(null);
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🎯 Défis Épargne - Méthode des Enveloppes</h1>

            <div className="flex flex-col md:flex-row gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Nom du défi"
                    className="border p-2 flex-1 rounded"
                    value={newChallenge.name}
                    onChange={(e) =>
                        setNewChallenge({ ...newChallenge, name: e.target.value })
                    }
                />
                <input
                    type="number"
                    placeholder="Montant total (€)"
                    className="border p-2 flex-1 rounded"
                    value={newChallenge.total}
                    onChange={(e) =>
                        setNewChallenge({ ...newChallenge, total: Number(e.target.value) })
                    }
                />
                <input
                    type="number"
                    placeholder="Nombre de cases"
                    className="border p-2 flex-1 rounded"
                    value={newChallenge.cases}
                    onChange={(e) =>
                        setNewChallenge({ ...newChallenge, cases: Number(e.target.value) })
                    }
                />
                <button
                    onClick={handleAddChallenge}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Ajouter
                </button>
            </div>

            {challenges.map((challenge) => (
                <div key={challenge.id} className="mb-6 border rounded p-4 shadow bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">{challenge.name}</h2>
                        <button
                            onClick={() => confirmDelete(challenge.id)}
                            className="text-red-600 text-sm hover:underline"
                        >
                            Supprimer
                        </button>
                    </div>
                    <p className="mb-2 text-gray-600">
                        Objectif : {challenge.total} € – {challenge.cases.length} cases de {challenge.cases[0]?.amount} €
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2">
                        {challenge.cases.map((c) => (
                            <button
                                key={c.id}
                                className={`w-14 h-14 text-sm font-bold rounded ${
                                    c.scratched
                                        ? 'bg-green-500 text-white line-through'
                                        : 'bg-gray-200 hover:bg-yellow-300'
                                }`}
                                onClick={() => toggleScratch(challenge.id, c.id)}
                            >
                                {c.scratched ? '✅' : `${c.amount} €`}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Popup de confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">❌ Supprimer ce défi ?</h3>
                        <p className="mb-4">Es-tu sûr de vouloir supprimer ce défi ? Cette action est irréversible.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteConfirmed}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvelopeChallenge;
