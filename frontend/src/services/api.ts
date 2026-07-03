import type { UploadResponse, Document, SearchResult, HistoryItem } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

// 1. Загрузка документа
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/v1/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Ошибка загрузки файла');
  }

  return response.json();
};

// 2. Получить список документов
export const getDocuments = async (): Promise<Document[]> => {
  const response = await fetch(`${API_BASE}/api/v1/documents`);

  if (!response.ok) {
    throw new Error('Ошибка получения списка документов');
  }

  return response.json();
};

// 3. Поиск
export const searchDocuments = async (
  query: string,
  page: number = 1
): Promise<SearchResult[]> => {
  const url = new URL(`${API_BASE}/api/v1/search`);
  url.searchParams.append('q', query);
  url.searchParams.append('page', String(page));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Ошибка поиска');
  }

  return response.json();
};

// 4. История (пока не используем, но оставим)
export const getHistory = async (limit: number = 10): Promise<HistoryItem[]> => {
  const response = await fetch(`${API_BASE}/api/v1/history?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Ошибка получения истории');
  }

  return response.json();
};