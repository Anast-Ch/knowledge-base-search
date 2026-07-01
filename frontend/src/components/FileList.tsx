import React from 'react';
import { FiFile, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './FileList.css';

interface FileItem {
  id: number;
  name: string;
  status: 'loading' | 'indexing' | 'ready' | 'error';
  progress?: number;
}

interface FileListProps {
  files: FileItem[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'ready': return <FiCheckCircle className="status-icon ready" />;
      case 'error': return <FiXCircle className="status-icon error" />;
      default: return null;
    }
  };

  const getStatusText = (status: FileItem['status']) => {
    switch (status) {
      case 'loading': return 'Загрузка...';
      case 'indexing': return 'Индексация...';
      case 'ready': return 'Готово';
      case 'error': return 'Ошибка';
      default: return status;
    }
  };

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'loading': return 'var(--status-loading, #D4A050)';
      case 'indexing': return 'var(--status-indexing, #B22222)';
      case 'ready': return 'var(--status-ready, #5C7A5E)';
      case 'error': return 'var(--status-error, #8B1A1A)';
      default: return 'var(--text-secondary, #5C4E44)';
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-list">
      <h3 className="file-list-title">Загруженные файлы</h3>
      {files.map((file) => (
        <div key={file.id} className="file-item">
          <div className="file-info">
            <div className="file-name-wrapper">
              <FiFile className="file-icon" />
              <span className="file-name">{file.name}</span>
            </div>
            <span
              className="file-status"
              style={{ color: getStatusColor(file.status) }}
            >
              {getStatusIcon(file.status)}
              {getStatusText(file.status)}
            </span>
          </div>
          {(file.status === 'loading' || file.status === 'indexing') && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${file.progress || 0}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileList;