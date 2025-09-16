import lien from '../pages/components/lien.js';

const API_BASE_URL = lien.url;

class AdminService {
  async getDashboardData() {
    try {
      const token = localStorage.getItem('jwt');

      console.log('Token trouvé:', token ? 'Oui' : 'Non');
      console.log('URL appelée:', `${API_BASE_URL}admin/dashboard`);

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      console.log('Token envoyé dans le body');

      const response = await fetch(`${API_BASE_URL}connection/admin/dashboard`, {
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
      console.error('Erreur lors de la récupération des données du dashboard:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}connection/admin/users`, {
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
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const token = localStorage.getItem('jwt');

      const response = await fetch(`${API_BASE_URL}connection/admin/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const token = localStorage.getItem('jwt');

      const response = await fetch(`${API_BASE_URL}connection/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      const token = localStorage.getItem('jwt');

      const response = await fetch(`${API_BASE_URL}connection/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export default new AdminService();