import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Heart, Shield, AlertTriangle } from 'lucide-react';
import './CGU.css';

const CGU = () => {
  const navigate = useNavigate();

  return (
    <div className="cgu-page">
      <div className="cgu-container">
        <button className="cgu-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Retour
        </button>

        <div className="cgu-header">
          <Code2 size={40} className="cgu-icon" />
          <h1>Conditions Générales d'Utilisation</h1>
          <p className="cgu-subtitle">Budget App — Projet d'apprentissage</p>
        </div>

        <div className="cgu-banner">
          <Heart size={20} />
          <span>Cette application est <strong>100% gratuite</strong> et développée dans un cadre d'apprentissage personnel.</span>
        </div>

        <div className="cgu-content">

          <section className="cgu-section">
            <h2>1. Présentation de l'application</h2>
            <p>
              Budget App est une application web de gestion de budget personnel, développée à titre
              <strong> éducatif</strong> dans le cadre d'un apprentissage du développement web (React, Vite, REST API).
              Elle n'est pas destinée à un usage commercial.
            </p>
          </section>

          <section className="cgu-section">
            <h2>2. Accès et gratuité</h2>
            <p>
              L'accès à l'application est entièrement <strong>gratuit</strong>. Aucun abonnement,
              aucun paiement ni aucune donnée bancaire ne sont demandés.
              L'application peut être modifiée, interrompue ou mise hors ligne à tout moment sans préavis.
            </p>
          </section>

          <section className="cgu-section">
            <h2>3. Données personnelles</h2>
            <p>
              Les données saisies (dépenses, revenus, catégories) sont stockées sur un serveur personnel
              à des fins de démonstration. Ces données ne sont <strong>ni vendues, ni partagées</strong> avec des tiers.
              Vous pouvez demander la suppression de votre compte à tout moment.
            </p>
          </section>

          <section className="cgu-section">
            <h2>4. Responsabilité</h2>
            <div className="cgu-alert">
              <AlertTriangle size={18} />
              <p>
                Cette application est fournie <strong>« en l'état »</strong>, sans aucune garantie
                d'exactitude, de disponibilité ou de sécurité des données. Elle ne constitue pas un
                conseil financier professionnel. L'auteur décline toute responsabilité en cas de perte
                ou d'inexactitude des données.
              </p>
            </div>
          </section>

          <section className="cgu-section">
            <h2>5. Propriété intellectuelle</h2>
            <p>
              Le code source de cette application est développé à des fins d'apprentissage.
              Les technologies utilisées (React, Vite, etc.) appartiennent à leurs propriétaires respectifs.
            </p>
          </section>

          <section className="cgu-section">
            <h2>6. Modification des CGU</h2>
            <p>
              Ces conditions peuvent être mises à jour à tout moment. La dernière mise à jour date
              du <strong>26 février 2026</strong>.
            </p>
          </section>

        </div>

        <div className="cgu-footer">
          <Shield size={16} />
          <span>Application développée pour apprendre à coder — aucun usage commercial</span>
        </div>
      </div>
    </div>
  );
};

export default CGU;
