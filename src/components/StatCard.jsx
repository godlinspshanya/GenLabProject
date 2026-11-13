function StatCard({ icon, value, label, color }) {
    const Icon = icon;

    return (
        <div className={`stat-card ${color}`}>
            <div className="stat-icon">
                <Icon size={28} />
            </div>

            <div>
                <h2>{value}</h2>
                <p>{label}</p>
            </div>
        </div>
    );
}

export default StatCard;