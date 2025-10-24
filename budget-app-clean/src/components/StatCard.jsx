import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {Icon && <Icon size={24} />}
        </div>
        <h3 className="stat-card-title">{title}</h3>
      </div>

      <div className="stat-card-value">{value}</div>

      {trend && (
        <div className={`stat-card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
};

export default StatCard;
