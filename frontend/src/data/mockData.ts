import type { Document, SearchResult, UploadFile } from '../types';

// Моковые файлы для страницы загрузки
export const mockFiles: UploadFile[] = [
  { id: 1, name: 'лекция_1.pdf', status: 'ready' },
  { id: 2, name: 'требования.docx', status: 'ready' },
  { id: 3, name: 'отчет_старый.docx', status: 'error' },
  { id: 4, name: 'архитектура_микросервисов.pdf', status: 'loading', progress: 45 },
];

// Моковые документы для страницы "Все документы" – с ISO-датами
export const mockDocuments: Document[] = [
  {
    document_id: '1',
    file_name: 'лекция_1.pdf',
    upload_date: '2026-06-25T14:30:00Z',
    status: 'Готово',
  },
  {
    document_id: '2',
    file_name: 'требования.docx',
    upload_date: '2026-06-25T15:00:00Z',
    status: 'Готово',
  },
  {
    document_id: '3',
    file_name: 'отчет_старый.docx',
    upload_date: '2026-06-24T10:15:00Z',
    status: 'Ошибка',
  },
  {
    document_id: '4',
    file_name: 'архитектура_микросервисов.pdf',
    upload_date: '2026-06-24T09:00:00Z',
    status: 'Готово',
  },
  {
    document_id: '5',
    file_name: 'инструкция_пользователя.docx',
    upload_date: '2026-06-23T16:45:00Z',
    status: 'Готово',
  },
];

// Моковые результаты поиска – поля соответствуют API
export const mockSearchResults: SearchResult[] = [
  {
    chunk_id: '1',
    file_name: 'лекция_1.pdf',
    page: 12,
    text: 'Архитектура на основе микросервисов позволяет масштабировать систему независимо по каждому компоненту. Это достигается за счет изоляции сервисов и использования асинхронного взаимодействия.',
    score: 2.45,
  },
  {
    chunk_id: '2',
    file_name: 'требования.docx',
    page: 1,
    text: 'Каждый микросервис должен иметь свою изолированную базу данных и не должен напрямую обращаться к данным других сервисов. Коммуникация происходит через API-шлюз.',
    score: 1.85,
  },
  {
    chunk_id: '3',
    file_name: 'архитектура_микросервисов.pdf',
    page: 5,
    text: 'Внедрение микросервисной архитектуры требует пересмотра процессов разработки и внедрения DevOps-практик. Важно обеспечить автоматизированное тестирование каждого сервиса.',
    score: 0.92,
  },
];