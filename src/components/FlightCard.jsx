
const FlightCard = ({ flight }) => {
    return (
        <div className="flight-card">
            <div className="flight-header">
                <div className="airline-info">
                    <img src={flight.airlineIcon} alt={flight.airline} className="airline-icon" />
                    <div className="airline-details">
                        <h3>{flight.airline}</h3>
                        <p className="flight-number">{flight.flightNumber}</p>
                    </div>
                </div>
                <div className="price-badge">
                    <span className="price">${flight.price}</span>
                </div>
            </div>

            <div className="flight-body">
                <div className="flight-route">
                    <div className="airport">
                        <span className="time">{flight.departureTime}</span>
                        <span className="code">{flight.departureCode}</span>
                        <span className="city">{flight.departureCity}</span>
                    </div>

                    <div className="flight-duration">
                        <div className="duration-line">
                            <span className="dot"></span>
                            <span className="line"></span>
                            <span className="dot"></span>
                        </div>
                        <span className="duration-text">{flight.duration}</span>
                        {flight.stops > 0 && <span className="stops">{flight.stops} parada{flight.stops > 1 ? 's' : ''}</span>}
                    </div>

                    <div className="airport">
                        <span className="time">{flight.arrivalTime}</span>
                        <span className="code">{flight.arrivalCode}</span>
                        <span className="city">{flight.arrivalCity}</span>
                    </div>
                </div>

                <div className="flight-info">
                    <div className="info-item">
                        <i className="fas fa-calendar"></i>
                        <span>{flight.date}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-users"></i>
                        <span>{flight.seats} asientos disponibles</span>
                    </div>
                </div>
            </div>

            <div className="flight-footer">
                <button className="btn-select">
                    <i className="fas fa-arrow-right"></i>
                    Seleccionar
                </button>
            </div>
        </div>
    );
};

export default FlightCard;

