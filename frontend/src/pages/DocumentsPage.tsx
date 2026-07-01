import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import { mockDocuments, mockSearchResults } from '../data/mockData';
import './DocumentsPage.css';

const DocumentsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(mockSearchResults);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Симуляция поиска
    setTimeout(() => {
      const filtered = mockSearchResults.filter(result =>
        result.text.toLowerCase().includes(query.toLowerCase()) ||
        result.fileName.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  // Подсветка совпадений
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <Navigation />
      <main className="documents-page">
        <div className="container">
          <h1 className="page-title">БИБЛИОТЕКА ДОКУМЕНТОВ</h1>

          {/* ПОИСК */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Введите поисковый запрос..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary search-btn">
              НАЙТИ
            </button>
          </form>

          {/* Результаты поиска */}
          {isSearching && <p className="loading-text">Поиск...</p>}

          {!isSearching && query && searchResults.length > 0 && (
            <div className="results-section">
              <p className="results-info">
                Найдено: {searchResults.length} результатов
              </p>
              {searchResults.map((result) => (
                <div key={result.id} className="card">
                  <h3 className="card-title">{result.fileName}</h3>
                  <p className="card-meta">
                    Страница {result.page} • Релевантность: {result.score.toFixed(2)}
                  </p>
                  <p className="card-text">
                    {highlightText(result.text, query)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isSearching && query && searchResults.length === 0 && (
            <p className="no-results">
              По вашему запросу ничего не найдено. Попробуйте изменить формулировку.
            </p>
          )}

          {/* СПИСОК ВСЕХ ДОКУМЕНТОВ */}
          {!query && (
            <div className="documents-list">
              <h2 className="documents-list-title">Все документы</h2>
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="doc-item">
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-date">{doc.date}</span>
                  <span className={`doc-status ${doc.status === 'Готово' ? 'ready' : 'error'}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="footer">
          <div className="container">
            <p>© 2026 Университетская поисковая система.</p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default DocumentsPage;