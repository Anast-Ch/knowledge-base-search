import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiSearch, FiClock, FiGithub, FiArrowRight } from 'react-icons/fi';
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
              <span className="hero-star-left">✦</span>
              <span className="hero-accent">П</span>ОИСКОВАЯ СИСТЕМА
              <span className="hero-star-right">✦</span>
              <br />
              <span className="hero-subtitle-line">по внутренней базе знаний университета</span>
            </h1>

            <button 
              className="hero-btn"
              onClick={() => navigate('/upload')}
            >
              НАЧАТЬ
              <FiArrowRight className="hero-btn-icon" />
            </button>
          </div>

          <section className="features">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-number">01</div>
                <FiBook className="feature-icon" />
                <h3 className="feature-title">Хранение документов</h3>
                <p className="feature-desc">
                  Загружайте PDF и DOCX файлы – система сохраняет их<br />
                  в структурированном виде для быстрого доступа
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-number">02</div>
                <FiSearch className="feature-icon" />
                <h3 className="feature-title">Поиск с подсветкой</h3>
                <p className="feature-desc">
                  Находите нужную информацию за секунды – все совпадения<br />
                  подсвечиваются прямо в тексте документа
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-number">03</div>
                <FiClock className="feature-icon" />
                <h3 className="feature-title">История запросов</h3>
                <p className="feature-desc">
                  Все ваши поисковые запросы сохраняются –<br />
                  легко возвращайтесь к предыдущим находкам
                </p>
              </div>
            </div>
          </section>

          <div className="open-source">
            <div className="open-source-divider">
              <span>✦</span>
              <span>✦</span>
              <span>✦</span>
            </div>
            <p className="open-source-text">
              <FiGithub className="github-icon" />
              открытый исходный код:
            </p>
            <a 
              href="https://github.com/Anast-Ch/knowledge-base-search/tree/backend" 
              target="_blank" 
              rel="noopener noreferrer"
              className="open-source-link"
            >
              github.com/Anast-Ch/knowledge-base-search
            </a>
          </div>
        </div>

        <footer className="footer">
          <div className="container">
            <div className="footer-logo-wrapper">
              <img 
                src="/logo-mtuci.png" 
                alt="МТУСИ" 
                className="footer-logo" 
              />
              <span className="footer-logo-text">МТУСИ</span>
            </div>
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