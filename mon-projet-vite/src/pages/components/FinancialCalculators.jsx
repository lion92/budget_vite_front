import React, { useState } from 'react';
import { Button, Card, Input } from './ui';
import './css/financial-calculators.css';

const FinancialCalculators = () => {
    const [activeCalculator, setActiveCalculator] = useState('savings');

    const calculators = {
        savings: {
            title: '💰 Calculateur d\'épargne',
            description: 'Calculez combien épargner pour atteindre vos objectifs',
            component: SavingsCalculator
        },
        budget: {
            title: '📊 Répartiteur de budget',
            description: 'Répartissez vos revenus selon la règle 50/30/20',
            component: BudgetCalculator
        },
        loan: {
            title: '🏠 Simulateur de crédit',
            description: 'Calculez vos mensualités de prêt',
            component: LoanCalculator
        },
        emergency: {
            title: '🆘 Fonds d\'urgence',
            description: 'Déterminez le montant idéal pour votre fonds d\'urgence',
            component: EmergencyFundCalculator
        },
        retirement: {
            title: '🏖️ Épargne retraite',
            description: 'Planifiez votre épargne pour la retraite',
            component: RetirementCalculator
        },
        debt: {
            title: '💳 Remboursement de dettes',
            description: 'Calculez le temps nécessaire pour rembourser vos dettes',
            component: DebtCalculator
        }
    };

    return (
        <div className="financial-calculators">
            <div className="calculators-header">
                <h1>🧮 Calculateurs Financiers</h1>
                <p>Des outils simples pour mieux gérer votre argent</p>
            </div>

            <div className="calculators-nav">
                {Object.entries(calculators).map(([key, calc]) => (
                    <button
                        key={key}
                        className={`calc-nav-button ${activeCalculator === key ? 'active' : ''}`}
                        onClick={() => setActiveCalculator(key)}
                    >
                        <span className="calc-title">{calc.title}</span>
                        <span className="calc-desc">{calc.description}</span>
                    </button>
                ))}
            </div>

            <div className="calculator-content">
                {React.createElement(calculators[activeCalculator].component)}
            </div>
        </div>
    );
};

const SavingsCalculator = () => {
    const [values, setValues] = useState({
        targetAmount: '',
        currentAmount: '',
        monthlyContribution: '',
        targetMonths: '',
        interestRate: '2'
    });
    const [result, setResult] = useState(null);

    const calculate = () => {
        const target = parseFloat(values.targetAmount) || 0;
        const current = parseFloat(values.currentAmount) || 0;
        const monthly = parseFloat(values.monthlyContribution) || 0;
        const months = parseInt(values.targetMonths) || 0;
        const rate = (parseFloat(values.interestRate) || 0) / 100 / 12;

        const remaining = target - current;

        if (monthly > 0 && months === 0) {
            // Calculer le temps nécessaire
            if (rate > 0) {
                const monthsNeeded = Math.log(1 + (remaining * rate) / monthly) / Math.log(1 + rate);
                setResult({
                    type: 'time',
                    months: Math.ceil(monthsNeeded),
                    years: Math.ceil(monthsNeeded / 12),
                    totalSaved: current + (monthly * Math.ceil(monthsNeeded)),
                    interestEarned: (monthly * Math.ceil(monthsNeeded)) - remaining
                });
            } else {
                const monthsNeeded = remaining / monthly;
                setResult({
                    type: 'time',
                    months: Math.ceil(monthsNeeded),
                    years: Math.ceil(monthsNeeded / 12),
                    totalSaved: target,
                    interestEarned: 0
                });
            }
        } else if (months > 0) {
            // Calculer le montant mensuel nécessaire
            if (rate > 0) {
                const monthlyNeeded = (remaining * rate) / (Math.pow(1 + rate, months) - 1);
                setResult({
                    type: 'amount',
                    monthlyAmount: monthlyNeeded,
                    totalContributions: monthlyNeeded * months,
                    interestEarned: target - current - (monthlyNeeded * months)
                });
            } else {
                const monthlyNeeded = remaining / months;
                setResult({
                    type: 'amount',
                    monthlyAmount: monthlyNeeded,
                    totalContributions: monthlyNeeded * months,
                    interestEarned: 0
                });
            }
        }
    };

    return (
        <Card className="calculator-card">
            <div className="calc-header">
                <h2>💰 Calculateur d'épargne</h2>
                <p>Planifiez votre épargne pour atteindre vos objectifs financiers</p>
            </div>

            <div className="calc-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Objectif d'épargne (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 10000"
                            value={values.targetAmount}
                            onChange={(e) => setValues({ ...values, targetAmount: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Épargne actuelle (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 2000"
                            value={values.currentAmount}
                            onChange={(e) => setValues({ ...values, currentAmount: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Épargne mensuelle (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 300"
                            value={values.monthlyContribution}
                            onChange={(e) => setValues({ ...values, monthlyContribution: e.target.value })}
                        />
                        <small>Laissez vide pour calculer le montant nécessaire</small>
                    </div>
                    <div className="form-group">
                        <label>Délai souhaité (mois)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 24"
                            value={values.targetMonths}
                            onChange={(e) => setValues({ ...values, targetMonths: e.target.value })}
                        />
                        <small>Laissez vide pour calculer le temps nécessaire</small>
                    </div>
                </div>

                <div className="form-group">
                    <label>Taux d'intérêt annuel (%)</label>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 2"
                        value={values.interestRate}
                        onChange={(e) => setValues({ ...values, interestRate: e.target.value })}
                    />
                    <small>Livret A : ~3%, Assurance vie : ~2-4%</small>
                </div>

                <Button variant="primary" onClick={calculate} disabled={!values.targetAmount}>
                    Calculer
                </Button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>📊 Résultats</h3>
                    {result.type === 'time' ? (
                        <div className="result-grid">
                            <div className="result-item">
                                <span className="result-label">Temps nécessaire :</span>
                                <span className="result-value">
                                    {result.months} mois ({result.years} an{result.years > 1 ? 's' : ''})
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Intérêts gagnés :</span>
                                <span className="result-value">{result.interestEarned.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                            </div>
                        </div>
                    ) : (
                        <div className="result-grid">
                            <div className="result-item">
                                <span className="result-label">Épargne mensuelle nécessaire :</span>
                                <span className="result-value highlight">
                                    {result.monthlyAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€/mois
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Total des contributions :</span>
                                <span className="result-value">{result.totalContributions.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Intérêts gagnés :</span>
                                <span className="result-value">{result.interestEarned.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

const BudgetCalculator = () => {
    const [income, setIncome] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        const monthlyIncome = parseFloat(income) || 0;
        if (monthlyIncome <= 0) return;

        setResult({
            income: monthlyIncome,
            needs: monthlyIncome * 0.5,        // 50% besoins
            wants: monthlyIncome * 0.3,        // 30% envies
            savings: monthlyIncome * 0.2       // 20% épargne
        });
    };

    return (
        <Card className="calculator-card">
            <div className="calc-header">
                <h2>📊 Répartiteur de budget (50/30/20)</h2>
                <p>Répartissez vos revenus selon la règle d'or de la gestion budgétaire</p>
            </div>

            <div className="calc-form">
                <div className="form-group">
                    <label>Revenus mensuels nets (€)</label>
                    <Input
                        type="number"
                        placeholder="Ex: 2500"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                    />
                    <small>Salaire après impôts et cotisations sociales</small>
                </div>

                <Button variant="primary" onClick={calculate} disabled={!income}>
                    Calculer la répartition
                </Button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>💰 Répartition recommandée</h3>
                    <div className="budget-breakdown">
                        <div className="budget-category">
                            <div className="category-header">
                                <span className="category-icon">🏠</span>
                                <div className="category-info">
                                    <h4>Besoins essentiels (50%)</h4>
                                    <p>Logement, nourriture, transport, santé</p>
                                </div>
                                <span className="category-amount">{result.needs.toLocaleString()}€</span>
                            </div>
                            <div className="category-examples">
                                <span>• Loyer/prêt immobilier</span>
                                <span>• Courses alimentaires</span>
                                <span>• Assurances obligatoires</span>
                                <span>• Factures (électricité, eau, internet)</span>
                            </div>
                        </div>

                        <div className="budget-category">
                            <div className="category-header">
                                <span className="category-icon">🎊</span>
                                <div className="category-info">
                                    <h4>Envies et loisirs (30%)</h4>
                                    <p>Sorties, hobbies, achats plaisir</p>
                                </div>
                                <span className="category-amount">{result.wants.toLocaleString()}€</span>
                            </div>
                            <div className="category-examples">
                                <span>• Restaurants et sorties</span>
                                <span>• Vêtements non essentiels</span>
                                <span>• Abonnements (Netflix, Spotify)</span>
                                <span>• Voyages et vacances</span>
                            </div>
                        </div>

                        <div className="budget-category">
                            <div className="category-header">
                                <span className="category-icon">💰</span>
                                <div className="category-info">
                                    <h4>Épargne et investissements (20%)</h4>
                                    <p>Économies, remboursements, projets</p>
                                </div>
                                <span className="category-amount">{result.savings.toLocaleString()}€</span>
                            </div>
                            <div className="category-examples">
                                <span>• Fonds d'urgence</span>
                                <span>• Épargne retraite</span>
                                <span>• Remboursement dettes</span>
                                <span>• Projets futurs</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const LoanCalculator = () => {
    const [values, setValues] = useState({
        loanAmount: '',
        interestRate: '',
        loanTerm: '',
        termType: 'years'
    });
    const [result, setResult] = useState(null);

    const calculate = () => {
        const principal = parseFloat(values.loanAmount) || 0;
        const rate = (parseFloat(values.interestRate) || 0) / 100 / 12;
        const termInMonths = values.termType === 'years'
            ? (parseInt(values.loanTerm) || 0) * 12
            : (parseInt(values.loanTerm) || 0);

        if (principal <= 0 || rate <= 0 || termInMonths <= 0) return;

        const monthlyPayment = (principal * rate * Math.pow(1 + rate, termInMonths)) /
                              (Math.pow(1 + rate, termInMonths) - 1);

        const totalPayment = monthlyPayment * termInMonths;
        const totalInterest = totalPayment - principal;

        setResult({
            monthlyPayment,
            totalPayment,
            totalInterest,
            termInMonths
        });
    };

    return (
        <Card className="calculator-card">
            <div className="calc-header">
                <h2>🏠 Simulateur de crédit</h2>
                <p>Calculez vos mensualités et le coût total de votre emprunt</p>
            </div>

            <div className="calc-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Montant emprunté (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 200000"
                            value={values.loanAmount}
                            onChange={(e) => setValues({ ...values, loanAmount: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Taux d'intérêt annuel (%)</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 3.5"
                            value={values.interestRate}
                            onChange={(e) => setValues({ ...values, interestRate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Durée du prêt</label>
                        <div className="input-group">
                            <Input
                                type="number"
                                placeholder="Ex: 25"
                                value={values.loanTerm}
                                onChange={(e) => setValues({ ...values, loanTerm: e.target.value })}
                            />
                            <select
                                value={values.termType}
                                onChange={(e) => setValues({ ...values, termType: e.target.value })}
                                className="term-select"
                            >
                                <option value="years">Années</option>
                                <option value="months">Mois</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={calculate}
                    disabled={!values.loanAmount || !values.interestRate || !values.loanTerm}
                >
                    Calculer les mensualités
                </Button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>💳 Détails du prêt</h3>
                    <div className="result-grid">
                        <div className="result-item highlight">
                            <span className="result-label">Mensualité :</span>
                            <span className="result-value">
                                {result.monthlyPayment.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}€/mois
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Coût total :</span>
                            <span className="result-value">
                                {result.totalPayment.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Intérêts totaux :</span>
                            <span className="result-value">
                                {result.totalInterest.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Durée :</span>
                            <span className="result-value">
                                {result.termInMonths} mois ({Math.round(result.termInMonths / 12)} ans)
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const EmergencyFundCalculator = () => {
    const [values, setValues] = useState({
        monthlyExpenses: '',
        situation: 'employee',
        dependents: '0'
    });
    const [result, setResult] = useState(null);

    const situations = {
        employee: { label: 'Salarié CDI', months: 3 },
        freelance: { label: 'Freelance/Indépendant', months: 6 },
        unstable: { label: 'Emploi instable', months: 9 },
        retired: { label: 'Retraité', months: 3 }
    };

    const calculate = () => {
        const monthly = parseFloat(values.monthlyExpenses) || 0;
        const dependents = parseInt(values.dependents) || 0;
        const baseSituation = situations[values.situation];

        if (monthly <= 0) return;

        // Ajuster selon les personnes à charge
        const adjustedMonths = baseSituation.months + (dependents * 0.5);
        const recommendedAmount = monthly * adjustedMonths;

        // Montants minimum et maximum
        const minimumAmount = monthly * 3;
        const maximumAmount = monthly * 12;

        setResult({
            recommendedAmount,
            minimumAmount,
            maximumAmount,
            months: adjustedMonths,
            monthlyGoal: recommendedAmount / 12, // Pour atteindre l'objectif en 1 an
            situation: baseSituation.label
        });
    };

    return (
        <Card className="calculator-card">
            <div className="calc-header">
                <h2>🆘 Calculateur de fonds d'urgence</h2>
                <p>Déterminez le montant idéal pour faire face aux imprévus</p>
            </div>

            <div className="calc-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Dépenses mensuelles essentielles (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 1500"
                            value={values.monthlyExpenses}
                            onChange={(e) => setValues({ ...values, monthlyExpenses: e.target.value })}
                        />
                        <small>Loyer, courses, factures, assurances</small>
                    </div>
                    <div className="form-group">
                        <label>Nombre de personnes à charge</label>
                        <select
                            value={values.dependents}
                            onChange={(e) => setValues({ ...values, dependents: e.target.value })}
                            className="form-select"
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4+</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Situation professionnelle</label>
                    <div className="situation-cards">
                        {Object.entries(situations).map(([key, situation]) => (
                            <button
                                key={key}
                                type="button"
                                className={`situation-card ${values.situation === key ? 'selected' : ''}`}
                                onClick={() => setValues({ ...values, situation: key })}
                            >
                                {situation.label}
                                <small>{situation.months} mois recommandés</small>
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="primary" onClick={calculate} disabled={!values.monthlyExpenses}>
                    Calculer mon fonds d'urgence
                </Button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>🎯 Votre fonds d'urgence idéal</h3>
                    <div className="result-highlight">
                        <div className="highlight-amount">
                            {result.recommendedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                        </div>
                        <div className="highlight-desc">
                            Équivalent à {result.months.toFixed(1)} mois de dépenses
                        </div>
                    </div>

                    <div className="result-details">
                        <div className="detail-item">
                            <span>💡 Pour économiser en 1 an :</span>
                            <span>{result.monthlyGoal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€/mois</span>
                        </div>
                        <div className="detail-item">
                            <span>🔹 Minimum absolu :</span>
                            <span>{result.minimumAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                        </div>
                        <div className="detail-item">
                            <span>🔸 Maximum recommandé :</span>
                            <span>{result.maximumAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                        </div>
                    </div>

                    <div className="emergency-tips">
                        <h4>💡 Conseils pour votre fonds d'urgence</h4>
                        <ul>
                            <li>Placez cet argent sur un livret A ou un compte épargne accessible</li>
                            <li>Ne l'utilisez QUE pour de vraies urgences (perte d'emploi, gros réparations)</li>
                            <li>Reconstituez-le dès que possible après utilisation</li>
                            <li>Révisez le montant chaque année selon vos dépenses</li>
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};

const RetirementCalculator = () => {
    const [values, setValues] = useState({
        currentAge: '',
        retirementAge: '65',
        currentSavings: '',
        monthlyContribution: '',
        targetAmount: '',
        returnRate: '4'
    });
    const [result, setResult] = useState(null);

    const calculate = () => {
        const currentAge = parseInt(values.currentAge) || 0;
        const retirementAge = parseInt(values.retirementAge) || 65;
        const currentSavings = parseFloat(values.currentSavings) || 0;
        const monthlyContribution = parseFloat(values.monthlyContribution) || 0;
        const targetAmount = parseFloat(values.targetAmount) || 0;
        const annualReturn = (parseFloat(values.returnRate) || 0) / 100;

        const yearsToRetirement = retirementAge - currentAge;
        const monthsToRetirement = yearsToRetirement * 12;
        const monthlyRate = annualReturn / 12;

        if (yearsToRetirement <= 0) return;

        // Valeur future de l'épargne actuelle
        const futureValueCurrent = currentSavings * Math.pow(1 + annualReturn, yearsToRetirement);

        // Valeur future des contributions mensuelles
        const futureValueMonthly = monthlyContribution *
            ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);

        const totalAtRetirement = futureValueCurrent + futureValueMonthly;
        const totalContributions = currentSavings + (monthlyContribution * monthsToRetirement);
        const totalReturns = totalAtRetirement - totalContributions;

        // Montant mensuel nécessaire pour atteindre l'objectif
        let monthlyNeeded = 0;
        if (targetAmount > 0) {
            const remainingNeeded = Math.max(0, targetAmount - futureValueCurrent);
            if (remainingNeeded > 0 && monthsToRetirement > 0) {
                monthlyNeeded = (remainingNeeded * monthlyRate) /
                              (Math.pow(1 + monthlyRate, monthsToRetirement) - 1);
            }
        }

        setResult({
            yearsToRetirement,
            totalAtRetirement,
            totalContributions,
            totalReturns,
            monthlyNeeded: targetAmount > 0 ? monthlyNeeded : null,
            targetAmount
        });
    };

    return (
        <Card className="calculator-card">
            <div className="calc-header">
                <h2>🏖️ Calculateur d'épargne retraite</h2>
                <p>Planifiez dès maintenant votre retraite sereinement</p>
            </div>

            <div className="calc-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Votre âge actuel</label>
                        <Input
                            type="number"
                            placeholder="Ex: 30"
                            value={values.currentAge}
                            onChange={(e) => setValues({ ...values, currentAge: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Âge de départ souhaité</label>
                        <Input
                            type="number"
                            placeholder="Ex: 65"
                            value={values.retirementAge}
                            onChange={(e) => setValues({ ...values, retirementAge: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Épargne retraite actuelle (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 15000"
                            value={values.currentSavings}
                            onChange={(e) => setValues({ ...values, currentSavings: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Épargne mensuelle (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 300"
                            value={values.monthlyContribution}
                            onChange={(e) => setValues({ ...values, monthlyContribution: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Objectif à la retraite (€) - optionnel</label>
                        <Input
                            type="number"
                            placeholder="Ex: 500000"
                            value={values.targetAmount}
                            onChange={(e) => setValues({ ...values, targetAmount: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Rendement annuel attendu (%)</label>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 4"
                            value={values.returnRate}
                            onChange={(e) => setValues({ ...values, returnRate: e.target.value })}
                        />
                        <small>Actions : 6-8%, Obligations : 3-5%, Mixte : 4-6%</small>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={calculate}
                    disabled={!values.currentAge || !values.retirementAge}
                >
                    Calculer ma retraite
                </Button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>🎯 Projection de votre retraite</h3>

                    <div className="retirement-summary">
                        <div className="summary-item">
                            <span className="summary-label">Dans {result.yearsToRetirement} ans, vous aurez :</span>
                            <span className="summary-value highlight">
                                {result.totalAtRetirement.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                            </span>
                        </div>
                    </div>

                    <div className="result-breakdown">
                        <div className="breakdown-item">
                            <span>💰 Vos contributions totales :</span>
                            <span>{result.totalContributions.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                        </div>
                        <div className="breakdown-item">
                            <span>📈 Gains d'investissement :</span>
                            <span>{result.totalReturns.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                        </div>

                        {result.monthlyNeeded !== null && result.targetAmount > 0 && (
                            <div className="breakdown-item highlight">
                                <span>🎯 Pour atteindre {result.targetAmount.toLocaleString()}€ :</span>
                                <span>
                                    {result.monthlyNeeded > 0
                                        ? `${result.monthlyNeeded.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€/mois`
                                        : "Objectif déjà atteint !"
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="retirement-tips">
                        <h4>💡 Conseils pour votre retraite</h4>
                        <ul>
                            <li>Commencez le plus tôt possible : l'effet des intérêts composés est puissant</li>
                            <li>Diversifiez vos placements : PER, assurance vie, immobilier</li>
                            <li>Profitez des avantages fiscaux du Plan Épargne Retraite (PER)</li>
                            <li>Révisez régulièrement votre stratégie d'épargne</li>
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};

const DebtCalculator = () => {
    const [values, setValues] = useState({
        totalDebt: '',
        interestRate: '',
        monthlyPayment: '',
        strategy: 'snowball'
    });
    const [result, setResult] = useState(null);

    const calculate = () => {
        const debt = parseFloat(values.totalDebt) || 0;
        const rate = (parseFloat(values.interestRate) || 0) / 100 / 12;
        const payment = parseFloat(values.monthlyPayment) || 0;

        if (debt <= 0 || payment <= 0 || rate < 0) return;

        // Calculer le temps de remboursement
        let months = 0;
        let totalInterest = 0;

        if (rate > 0) {
            months = Math.log(1 + (debt * rate) / payment) / Math.log(1 + rate);
            const totalPayment = payment * months;
            totalInterest = totalPayment - debt;
        } else {
            months = debt / payment;
            totalInterest = 0;
        }

        // Calculer les économies avec un paiement supplémentaire
        const extraPayment = payment * 0.1; // 10% de plus
        let monthsWithExtra = 0;
        let interestWithExtra = 0;

        if (rate > 0) {
            monthsWithExtra = Math.log(1 + (debt * rate) / (payment + extraPayment)) / Math.log(1 + rate);
            const totalPaymentWithExtra = (payment + extraPayment) * monthsWithExtra;
            interestWithExtra = totalPaymentWithExtra - debt;
        } else {
            monthsWithExtra = debt / (payment + extraPayment);
        }

        const timeSaved = months - monthsWithExtra;
        const interestSaved = totalInterest - interestWithExtra;

        setResult({
            months: Math.ceil(months),
            years: Math.ceil(months / 12),
            totalInterest,
            monthsWithExtra: Math.ceil(monthsWithExtra),
            timeSaved: Math.ceil(timeSaved),
            interestSaved,
            extraPayment
        });
    };

    return (
        <Card className="calculator-card">
            <div className="calc-header">
                <h2>💳 Calculateur de remboursement de dettes</h2>
                <p>Planifiez le remboursement de vos dettes et économisez sur les intérêts</p>
            </div>

            <div className="calc-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Montant total des dettes (€)</label>
                        <Input
                            type="number"
                            placeholder="Ex: 8000"
                            value={values.totalDebt}
                            onChange={(e) => setValues({ ...values, totalDebt: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Taux d'intérêt moyen annuel (%)</label>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 12"
                            value={values.interestRate}
                            onChange={(e) => setValues({ ...values, interestRate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Paiement mensuel prévu (€)</label>
                    <Input
                        type="number"
                        placeholder="Ex: 300"
                        value={values.monthlyPayment}
                        onChange={(e) => setValues({ ...values, monthlyPayment: e.target.value })}
                    />
                </div>

                <Button
                    variant="primary"
                    onClick={calculate}
                    disabled={!values.totalDebt || !values.monthlyPayment}
                >
                    Calculer le remboursement
                </Button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>📊 Plan de remboursement</h3>

                    <div className="debt-scenario">
                        <h4>🎯 Scénario actuel</h4>
                        <div className="scenario-details">
                            <div className="detail-item">
                                <span>Durée de remboursement :</span>
                                <span>{result.months} mois ({result.years} ans)</span>
                            </div>
                            <div className="detail-item">
                                <span>Intérêts totaux :</span>
                                <span>{result.totalInterest.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                            </div>
                        </div>
                    </div>

                    <div className="debt-scenario improvement">
                        <h4>🚀 En payant {result.extraPayment.toFixed(0)}€ de plus par mois</h4>
                        <div className="scenario-details">
                            <div className="detail-item">
                                <span>Nouvelle durée :</span>
                                <span>{result.monthsWithExtra} mois</span>
                            </div>
                            <div className="detail-item highlight">
                                <span>Temps économisé :</span>
                                <span>{result.timeSaved} mois</span>
                            </div>
                            <div className="detail-item highlight">
                                <span>Intérêts économisés :</span>
                                <span>{result.interestSaved.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                            </div>
                        </div>
                    </div>

                    <div className="debt-tips">
                        <h4>💡 Stratégies de remboursement</h4>
                        <ul>
                            <li><strong>Méthode avalanche :</strong> Remboursez d'abord les dettes à taux élevé</li>
                            <li><strong>Méthode boule de neige :</strong> Remboursez d'abord les petites dettes</li>
                            <li><strong>Consolidation :</strong> Regroupez vos dettes pour un taux plus bas</li>
                            <li><strong>Paiements supplémentaires :</strong> Même 20€ de plus font la différence</li>
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default FinancialCalculators;