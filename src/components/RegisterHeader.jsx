import React from 'react';
import { Link } from 'react-router-DOM';

const RegisterHeader = () => {
  return (
    <header className="register-header">
      <div className="header-content">
        <div className="logo">
          <img
            src="/assets/flyT_icon_128.png"
            alt="FlyTransportation Logo"
            className="logo-img"
          />
          <span className="logo-text">FlyTransportation</span>
        </div>
        <nav className="header-actions">
          <Link to="/login" className="login-link">Iniciar sesión</Link>
        </nav>
      </div>
    </header>
  );
};

export default RegisterHeader;