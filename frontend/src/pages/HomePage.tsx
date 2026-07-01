import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiSearch, FiClock, FiGithub } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <main className="home">
        <div className="container home-inner">
          <div className="hero">
            <h1 className="hero-title">
              <span className="hero-accent">П</span>оисковая система<br />
              по внутренней базе знаний<br />
              университета
            </h1>
            <button 
              className="btn-primary hero-btn"
              onClick={() => navigate('/upload')}
            >
              НАЧАТЬ
            </button>
          </div>

          {/* Возможности */}
          <section className="features">
            <div className="features-grid">
              <div className="feature-card">
                <FiBook className="feature-icon" />
                <h3 className="feature-title">Хранение документов</h3>
                <p className="feature-desc">
                  Загружайте PDF и DOCX файлы — система сохраняет их<br />
                  в структурированном виде для быстрого доступа
                </p>
              </div>

              <div className="feature-card">
                <FiSearch className="feature-icon" />
                <h3 className="feature-title">Умный поиск с подсветкой</h3>
                <p className="feature-desc">
                  Находите нужную информацию за секунды — все совпадения<br />
                  подсвечиваются прямо в тексте документа
                </p>
              </div>

              <div className="feature-card">
                <FiClock className="feature-icon" />
                <h3 className="feature-title">История запросов</h3>
                <p className="feature-desc">
                  Все ваши поисковые запросы сохраняются —<br />
                  легко возвращайтесь к предыдущим находкам
                </p>
              </div>
            </div>
          </section>

          {/* Open source */}
          <div className="open-source">
            <p className="open-source-text">
              <FiGithub className="github-icon" />
              Проект содержит открытый исходный код:
            </p>
            <a 
              href="https://github.com/Anast-Ch/knowledge-base-search/tree/main" 
              target="_blank" 
              rel="noopener noreferrer"
              className="open-source-link"
            >
              github.com/Anast-Ch/knowledge-base-search
            </a>
          </div>
        </div>

        {/* Кредиты */}
        <footer className="footer">
          <div className="container">
            <p>© 2026 Университетская поисковая система.</p>
            <p className="footer-sub">
              сделано в рамках учебной практики студентами МТУСИ
            </p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default HomePage;