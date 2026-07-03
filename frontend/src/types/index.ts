// Ответ при загрузке документа
export interface UploadResponse {
  document_id: string;
  file_name: string;
  status: string;
}

// Документ в списке (GET /documents)
export interface Document {
  document_id: string;
  file_name: string;
  upload_date: string; // ISO 8601 с временем
  status: string;
}

// Результат поиска (GET /search)
export interface SearchResult {
  chunk_id: string;
  file_name: string;
  page: number;
  text: string;
  score: number;
}

// История запросов (GET /history)
export interface HistoryItem {
  id: number;
  query: string;
  created_at: string;
}

// Статус файла в UI (для страницы загрузки)
export interface UploadFile {
  id: number;
  name: string;
  status: 'loading' | 'indexing' | 'ready' | 'error';
  progress?: number;
}