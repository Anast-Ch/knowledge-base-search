import React, { useState } from 'react';
import { FiSearch, FiFileText, FiClock } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import { mockDocuments, mockSearchResults } from '../data/mockData';
import './DocumentsPage.css';

// Тип для результатов поиска (объединяем поля)
interface SearchResultItem {
  id: string;
  fileName: string;
  page: number;
  text: string;
  score: number;
}

const DocumentsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Результаты поиска
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  // Выполнить поиск (по имени из mockDocuments и по имени/тексту из mockSearchResults)
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    // 1. Ищем по mockDocuments (по имени)
    const docMatches = mockDocuments
      .filter((doc) => doc.name.toLowerCase().includes(lowerQuery))
      .map((doc) => ({
        id: doc.id,
        fileName: doc.name,
        page: 0,
        text: '', // текста нет, но можно оставить пустым
        score: 0,
      }));

    // 2. Ищем по mockSearchResults (по имени и тексту)
    const searchMatches = mockSearchResults.filter(
      (item) =>
        item.fileName.toLowerCase().includes(lowerQuery) ||
        item.text.toLowerCase().includes(lowerQuery)
    );

    // 3. Объединяем, убираем дубликаты по fileName (если документ найден и там, и там)
    const combined = [...docMatches, ...searchMatches];
    const unique = combined.filter(
      (item, index, self) => self.findIndex((i) => i.fileName === item.fileName) === index
    );

    setSearchResults(unique);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentPage(1);
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      performSearch(query);
      setIsSearching(false);
      setCurrentPage(1);
    }, 300);
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  // ---- Пагинация ----
  const totalDocPages = Math.ceil(mockDocuments.length / itemsPerPage);
  const startDoc = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = mockDocuments.slice(startDoc, startDoc + itemsPerPage);

  const totalSearchPages = Math.ceil(searchResults.length / itemsPerPage);
  const startSearch = (currentPage - 1) * itemsPerPage;
  const paginatedSearch = searchResults.slice(startSearch, startSearch + itemsPerPage);

  const totalPages = query ? totalSearchPages : totalDocPages;
  const hasSearchResults = searchResults.length > 0;
  const showNoResults = query && !isSearching && !hasSearchResults;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <Navigation />
      <main className="documents-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">
              <span className="title-star-left">✦</span>
              ВСЕ ДОКУМЕНТЫ
              <span className="title-star-right">✦</span>
            </h1>
            <p className="page-subtitle">библиотека загруженных файлов</p>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Введите поисковой запрос"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary search-btn" disabled={isSearching}>
              {isSearching ? 'ПОИСК...' : 'НАЙТИ'}
            </button>
          </form>

          {isSearching && (
            <div className="loading-indicator">
              <span>✦</span> Ищем... <span>✦</span>
            </div>
          )}

          {!isSearching && query && hasSearchResults && (
            <div className="results-section">
              <div className="results-header">
                <span className="results-count">Найдено: {searchResults.length}</span>
                <span className="results-query">по запросу «{query}»</span>
              </div>
              {paginatedSearch.map((result) => (
                <div key={result.id} className="result-card">
                  <div className="result-card-header">
                    <FiFileText className="result-file-icon" />
                    <h3 className="result-file-name">
                      {highlightText(result.fileName, query)}
                    </h3>
                    {result.score > 0 && (
                      <span className="result-score">релевантность {result.score.toFixed(2)}</span>
                    )}
                  </div>
                  {result.page > 0 && (
                    <p className="result-meta">
                      Страница {result.page} • {result.fileName}
                    </p>
                  )}
                  {result.text && (
                    <p className="result-text">{highlightText(result.text, query)}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {showNoResults && (
            <div className="no-results">
              <p>✦ По вашему запросу ничего не найдено ✦</p>
              <p className="no-results-hint">Попробуйте изменить формулировку</p>
            </div>
          )}

          {!query && (
            <div className="documents-list">
              <div className="documents-grid">
                {paginatedDocs.map((doc) => (
                  <div key={doc.id} className="doc-item">
                    <div className="doc-icon-wrapper">
                      <FiFileText className="doc-icon" />
                    </div>
                    <div className="doc-info">
                      <span className="doc-name">{doc.name}</span>
                      <span className="doc-date">
                        <FiClock className="doc-date-icon" />
                        {doc.date}
                      </span>
                    </div>
                    <span className={`doc-status ${doc.status === 'Готово' ? 'ready' : 'error'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isSearching && (
            (query && searchResults.length > itemsPerPage) ||
            (!query && mockDocuments.length > itemsPerPage)
          ) && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Назад
              </button>
              <span className="pagination-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Вперед →
              </button>
            </div>
          )}
        </div>

        <footer className="footer">
          <div className="container">
            <div className="footer-logo-wrapper">
              <img src="/logo-mtuci.png" alt="МТУСИ" className="footer-logo" />
              <span className="footer-logo-text">МТУСИ</span>
            </div>
            <p>© 2026 Университетская поисковая система.</p>
            <p className="footer-sub">сделано в рамках учебной практики студентами МТУСИ</p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default DocumentsPage;