import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiFileText, FiClock, FiX, FiTrash2 } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import { mockDocuments, mockSearchResults } from '../data/mockData';
import type { SearchResult } from '../types'; // Document не используется
import './DocumentsPage.css';

const DocumentsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const itemsPerPage = 5;

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Закрывать историю при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск по мокам (заменить на реальный API позже)
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = mockSearchResults.filter(
      (item) =>
        item.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    addToHistory(query);
    setShowHistory(false);

    setIsSearching(true);
    setTimeout(() => {
      performSearch(query);
      setIsSearching(false);
      setCurrentPage(1);
    }, 300);
  };

  const addToHistory = (searchQuery: string) => {
    setSearchHistory((prev) => {
      const newHistory = [searchQuery, ...prev.filter((item) => item !== searchQuery)];
      return newHistory.slice(0, 10);
    });
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    addToHistory(historyQuery);
    setShowHistory(false);

    setIsSearching(true);
    setTimeout(() => {
      performSearch(historyQuery);
      setIsSearching(false);
      setCurrentPage(1);
    }, 300);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeHistoryItem = (e: React.MouseEvent, historyQuery: string) => {
    e.stopPropagation();
    setSearchHistory((prev) => prev.filter((item) => item !== historyQuery));
  };

  // Подсветка совпадений
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
  // Для списка документов (без поиска)
  const totalDocPages = Math.ceil(mockDocuments.length / itemsPerPage);
  const startDoc = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = mockDocuments.slice(startDoc, startDoc + itemsPerPage);

  // Для результатов поиска
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

  // Форматирование даты с временем
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

          {/* ПОИСК С ВЫПАДАЮЩЕЙ ИСТОРИЕЙ */}
          <div className="search-container-wrapper" ref={historyRef}>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-wrapper">
                <FiSearch className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Введите поисковой запрос"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowHistory(true);
                  }}
                  onFocus={() => setShowHistory(true)}
                />
                {query && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setQuery('');
                      searchInputRef.current?.focus();
                    }}
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary search-btn" disabled={isSearching}>
                {isSearching ? 'ПОИСК...' : 'НАЙТИ'}
              </button>
            </form>

            {/* ВЫПАДАЮЩАЯ ИСТОРИЯ ПОИСКА */}
            {showHistory && searchHistory.length > 0 && (
              <div className="search-history-dropdown">
                <div className="history-dropdown-header">
                  <div className="history-dropdown-title">
                    <FiClock />
                    <span>История поиска</span>
                  </div>
                  <button className="history-dropdown-clear" onClick={clearHistory}>
                    <FiTrash2 /> Очистить
                  </button>
                </div>
                <ul className="history-dropdown-list">
                  {searchHistory.map((item, index) => (
                    <li
                      key={index}
                      className="history-dropdown-item"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <FiClock className="history-dropdown-icon" />
                      <span className="history-dropdown-text">{item}</span>
                      <button
                        className="history-dropdown-remove"
                        onClick={(e) => removeHistoryItem(e, item)}
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showHistory && searchHistory.length === 0 && (
              <div className="search-history-dropdown empty">
                <div className="history-empty-state">
                  <FiClock className="empty-state-icon" />
                  <p>История поиска пуста</p>
                  <span>Ваши запросы появятся здесь</span>
                </div>
              </div>
            )}
          </div>

          {isSearching && (
            <div className="loading-indicator">
              <span>✦</span> Ищем... <span>✦</span>
            </div>
          )}

          {/* РЕЗУЛЬТАТЫ ПОИСКА */}
          {!isSearching && query && hasSearchResults && (
            <div className="results-section">
              <div className="results-header">
                <span className="results-count">Найдено: {searchResults.length}</span>
                <span className="results-query">по запросу «{query}»</span>
              </div>
              {paginatedSearch.map((result) => (
                <div key={result.chunk_id} className="result-card">
                  <div className="result-card-header">
                    <FiFileText className="result-file-icon" />
                    <h3 className="result-file-name">
                      {highlightText(result.file_name, query)}
                    </h3>
                    <span className="result-score">релевантность {result.score.toFixed(2)}</span>
                  </div>
                  <p className="result-meta">
                    Страница {result.page} • {result.file_name}
                  </p>
                  <p className="result-text">{highlightText(result.text, query)}</p>
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

          {/* СПИСОК ВСЕХ ДОКУМЕНТОВ */}
          {!query && (
            <div className="documents-list">
              <div className="documents-grid">
                {paginatedDocs.map((doc) => (
                  <div key={doc.document_id} className="doc-item">
                    <div className="doc-icon-wrapper">
                      <FiFileText className="doc-icon" />
                    </div>
                    <div className="doc-info">
                      <span className="doc-name">{doc.file_name}</span>
                      <span className="doc-date">
                        <FiClock className="doc-date-icon" />
                        {formatDate(doc.upload_date)}
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

          {/* ПАГИНАЦИЯ */}
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