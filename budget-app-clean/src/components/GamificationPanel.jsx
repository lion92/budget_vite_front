import useGamifyStore, { LEVELS, BADGES } from '../store/useGamifyStore';
import './GamificationPanel.css';

const GamificationPanel = () => {
  const { xp, badges, streak, getCurrentLevel, getNextLevel } = useGamifyStore();
  const currentLevel = getCurrentLevel();
  const next         = getNextLevel();

  const progressPct = next
    ? Math.min(((xp - currentLevel.minXP) / (next.minXP - currentLevel.minXP)) * 100, 100)
    : 100;

  return (
    <div className="gamification-panel">
      <div className="gami-header">
        <div
          className="gami-level-badge"
          style={{ background: `${currentLevel.color}22`, border: `2px solid ${currentLevel.color}` }}
        >
          {currentLevel.emoji}
        </div>

        <div className="gami-info">
          <div className="gami-title-row">
            <span className="gami-level-label">Niveau {currentLevel.level}</span>
            <span className="gami-level-name">— {currentLevel.title}</span>
          </div>
          <div className="gami-xp-row">
            <div className="gami-xp-bar-wrap">
              <div
                className="gami-xp-bar-fill"
                style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${next?.color ?? currentLevel.color})` }}
              />
            </div>
            <span className="gami-xp-text">
              {next ? `${xp} / ${next.minXP} XP` : `${xp} XP — MAX`}
            </span>
          </div>
          {!next && <p className="gami-max-level">Vous avez atteint le niveau maximum !</p>}
        </div>

        {streak > 0 && (
          <div className="gami-streak">
            🔥 {streak} jour{streak > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <hr className="gami-divider" />

      <div className="gami-badges-section">
        <h4>Succès ({badges.length}/{BADGES.length})</h4>
        <div className="gami-badges-grid">
          {BADGES.map((badge) => {
            const earned = badges.includes(badge.id);
            return (
              <div key={badge.id} className={`gami-badge ${earned ? 'earned' : 'locked'}`}>
                {badge.icon}
                <div className="gami-badge-tooltip">
                  <strong>{badge.label}</strong>
                  {badge.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;
