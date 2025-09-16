import lien from '../pages/components/lien.js';

const API_BASE_URL = lien.url;

class UserDashboardService {
  async getDashboardData() {
    try {
      const token = localStorage.getItem('jwt');

      console.log('Token trouvé:', token ? 'Oui' : 'Non');
      console.log('URL appelée:', `${API_BASE_URL}connection/dashboard/user`);

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      console.log('Token envoyé dans le body');

      const response = await fetch(`${API_BASE_URL}connection/dashboard/user`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jwt: token })
      });

      console.log('Status de la réponse:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Réponse d\'erreur:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des données du dashboard utilisateur:', error);
      throw error;
    }
  }

  async getUserBudgets() {
    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}connection/user/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt: token })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des budgets utilisateur:', error);
      throw error;
    }
  }

  async getUserExpenses() {
    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}connection/user/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt: token })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses utilisateur:', error);
      throw error;
    }
  }
}

export default new UserDashboardService();