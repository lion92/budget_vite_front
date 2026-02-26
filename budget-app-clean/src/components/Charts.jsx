import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Charts.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart colors palette
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
  cyan: '#06b6d4',
  indigo: '#6366f1'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.danger,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
  COLORS.orange,
  COLORS.cyan,
  COLORS.indigo
];

// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
          if (value !== null) {
            label += new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(value);
          }
          return label;
        }
      }
    }
  }
};

// Expenses by Category Doughnut Chart
export const ExpensesByCategoryChart = ({ expenses }) => {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [{
          label: 'Dépenses',
          data: [0],
          backgroundColor: [COLORS.primary + 'CC'],
          borderColor: [COLORS.primary],
          borderWidth: 2
        }]
      };
    }

    const categoryMap = {};

    expenses.forEach((expense) => {
      const categoryName = expense.categorie || 'Sans catégorie';

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0;
      }
      categoryMap[categoryName] += parseFloat(expense.montant || 0);
    });

    const sortedCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedCategories.map(([name]) => name),
      datasets: [{
        label: 'Dépenses',
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: CHART_COLORS.map(color => color + 'CC'),
        borderColor: CHART_COLORS,
        borderWidth: 2,
        hoverOffset: 10
      }]
    };
  }, [expenses]);

  const options = {
    ...commonOptions,
    cutout: '60%',
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'right'
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Répartition par Catégorie</h3>
      <div className="chart-wrapper">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// Monthly Expenses Trend Line Chart
export const MonthlyTrendChart = ({ expenses, revenues }) => {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [
          {
            label: 'Dépenses',
            data: [0],
            borderColor: COLORS.danger,
            backgroundColor: COLORS.danger + '33',
            borderWidth: 3
          },
          {
            label: 'Revenus',
            data: [0],
            borderColor: COLORS.success,
            backgroundColor: COLORS.success + '33',
            borderWidth: 3
          }
        ]
      };
    }

    const monthlyData = {};

    // Process expenses
    expenses.forEach((expense) => {
      try {
        const date = new Date(expense.dateTransaction.toString().replace(/\//g, '-'));
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { expenses: 0, revenues: 0 };
          }
          monthlyData[monthKey].expenses += parseFloat(expense.montant || 0);
        }
      } catch (e) {
        console.error('Error parsing expense date:', e);
      }
    });

    // Process revenues
    if (revenues && revenues.length > 0) {
      revenues.forEach((revenue) => {
        try {
          const date = new Date(revenue.date || revenue.dateRevenu);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { expenses: 0, revenues: 0 };
            }
            monthlyData[monthKey].revenues += parseFloat(revenue.amount || revenue.montant || 0);
          }
        } catch (e) {
          console.error('Error parsing revenue date:', e);
        }
      });
    }

    const sortedMonths = Object.keys(monthlyData).sort();

    // Check if we have data from a single year (all months from same year)
    const years = [...new Set(sortedMonths.map(month => month.split('-')[0]))];
    const isSingleYear = years.length === 1;

    // If single year, show all 12 months; otherwise show last 6 months
    let displayMonths;
    if (isSingleYear) {
      // Generate all 12 months for the year
      const year = years[0];
      displayMonths = Array.from({ length: 12 }, (_, i) => {
        const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
        // Add missing months with zero values
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, revenues: 0 };
        }
        return monthKey;
      });
    } else {
      displayMonths = sortedMonths.slice(-6);
    }

    if (displayMonths.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [
          {
            label: 'Dépenses',
            data: [0],
            borderColor: COLORS.danger,
            backgroundColor: COLORS.danger + '33'
          },
          {
            label: 'Revenus',
            data: [0],
            borderColor: COLORS.success,
            backgroundColor: COLORS.success + '33'
          }
        ]
      };
    }

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const labels = displayMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Dépenses',
          data: displayMonths.map(month => monthlyData[month].expenses),
          borderColor: COLORS.danger,
          backgroundColor: COLORS.danger + '33',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: COLORS.danger,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Revenus',
          data: displayMonths.map(month => monthlyData[month].revenues),
          borderColor: COLORS.success,
          backgroundColor: COLORS.success + '33',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: COLORS.success,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }, [expenses, revenues]);

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Évolution Mensuelle</h3>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// Budget vs Actual Bar Chart
export const BudgetComparisonChart = ({ expenses, categories }) => {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0 || !categories || categories.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [
          {
            label: 'Budget',
            data: [0],
            backgroundColor: COLORS.primary + 'AA',
            borderColor: COLORS.primary,
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Dépensé',
            data: [0],
            backgroundColor: COLORS.success + 'AA',
            borderColor: COLORS.success,
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthExpenses = expenses.filter((exp) => {
      try {
        const expDate = new Date(exp.dateTransaction.toString().replace(/\//g, '-'));
        return !isNaN(expDate.getTime()) && expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      } catch (e) {
        return false;
      }
    });

    // Map categories by name with their budgets
    const categoryBudgetMap = {};
    categories.forEach(cat => {
      if (cat.nom && cat.budget) {
        categoryBudgetMap[cat.nom] = parseFloat(cat.budget);
      }
    });

    const categoryData = {};

    monthExpenses.forEach((expense) => {
      const categoryName = expense.categorie || 'Sans catégorie';
      const budget = categoryBudgetMap[categoryName] || 0;

      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          actual: 0,
          budget: budget
        };
      }
      categoryData[categoryName].actual += parseFloat(expense.montant || 0);
    });

    const sortedCategories = Object.entries(categoryData)
      .filter(([, data]) => data.budget > 0)
      .sort((a, b) => b[1].actual - a[1].actual)
      .slice(0, 8);

    if (sortedCategories.length === 0) {
      return {
        labels: ['Aucune catégorie avec budget'],
        datasets: [
          {
            label: 'Budget',
            data: [0],
            backgroundColor: COLORS.primary + 'AA',
            borderColor: COLORS.primary,
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Dépensé',
            data: [0],
            backgroundColor: COLORS.success + 'AA',
            borderColor: COLORS.success,
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      };
    }

    return {
      labels: sortedCategories.map(([name]) => name),
      datasets: [
        {
          label: 'Budget',
          data: sortedCategories.map(([, data]) => data.budget),
          backgroundColor: COLORS.primary + 'AA',
          borderColor: COLORS.primary,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Dépensé',
          data: sortedCategories.map(([, data]) => data.actual),
          backgroundColor: sortedCategories.map(([, data]) =>
            data.actual > data.budget ? COLORS.danger + 'AA' : COLORS.success + 'AA'
          ),
          borderColor: sortedCategories.map(([, data]) =>
            data.actual > data.budget ? COLORS.danger : COLORS.success
          ),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    };
  }, [expenses, categories]);

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'top'
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Budget vs Réel (Mois en cours)</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Top Expenses Bar Chart
export const TopExpensesChart = ({ expenses }) => {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [{
          label: 'Montant',
          data: [0],
          backgroundColor: [COLORS.primary + 'BB'],
          borderColor: [COLORS.primary],
          borderWidth: 2,
          borderRadius: 6
        }]
      };
    }

    const topExpenses = [...expenses]
      .sort((a, b) => parseFloat(b.montant) - parseFloat(a.montant))
      .slice(0, 10);

    return {
      labels: topExpenses.map(exp =>
        exp.description && exp.description.length > 20
          ? exp.description.substring(0, 20) + '...'
          : exp.description || 'Sans description'
      ),
      datasets: [{
        label: 'Montant',
        data: topExpenses.map(exp => parseFloat(exp.montant || 0)),
        backgroundColor: topExpenses.map((_, index) => CHART_COLORS[index % CHART_COLORS.length] + 'BB'),
        borderColor: topExpenses.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }]
    };
  }, [expenses]);

  const options = {
    ...commonOptions,
    indexAxis: 'y',
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            // Pour les barres horizontales, la valeur est dans context.parsed.x
            const value = context.parsed.x;
            if (value !== null) {
              label += new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(value);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top 10 Dépenses</h3>
      <div className="chart-wrapper" style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Weekly Expenses Chart
export const WeeklyExpensesChart = ({ expenses }) => {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
        datasets: [{
          label: 'Dépenses hebdomadaires',
          data: [0, 0, 0, 0],
          backgroundColor: COLORS.warning + 'BB',
          borderColor: COLORS.warning,
          borderWidth: 2,
          borderRadius: 8
        }]
      };
    }

    const weeklyData = {};
    const today = new Date();
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);

    expenses.forEach((expense) => {
      try {
        const date = new Date(expense.dateTransaction.toString().replace(/\//g, '-'));

        if (!isNaN(date.getTime()) && date >= fourWeeksAgo && date <= today) {
          const weekNumber = Math.floor((today - date) / (7 * 24 * 60 * 60 * 1000));
          const weekLabel = `Semaine ${4 - weekNumber}`;

          if (!weeklyData[weekLabel]) {
            weeklyData[weekLabel] = 0;
          }
          weeklyData[weekLabel] += parseFloat(expense.montant || 0);
        }
      } catch (e) {
        console.error('Error parsing expense date:', e);
      }
    });

    const labels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
    const data = labels.map(label => weeklyData[label] || 0);

    return {
      labels,
      datasets: [{
        label: 'Dépenses hebdomadaires',
        data,
        backgroundColor: COLORS.warning + 'BB',
        borderColor: COLORS.warning,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }, [expenses]);

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Dépenses des 4 Dernières Semaines</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
