import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiUpload, FiFileText } from 'react-icons/fi';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-accent">П</span>оисковая система
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <FiSearch size={18} />
              Найти
            </Link>
          </li>
          <li>
            <Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>
              <FiUpload size={18} />
              Загрузить
            </Link>
          </li>
          <li>
            <Link to="/documents" className={location.pathname === '/documents' ? 'active' : ''}>
              <FiFileText size={18} />
              Все документы
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;