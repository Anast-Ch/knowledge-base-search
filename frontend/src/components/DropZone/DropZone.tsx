import { useState, useRef } from 'react';
import { MdCloudUpload, MdInsertDriveFile, MdClose, MdCheckCircle, MdError, MdHourglassEmpty } from 'react-icons/md';
import './DropZone.css';

// Тип для файла с его статусом
interface FileWithStatus {
  id: string;
  file: File;
  status: 'uploading' | 'indexing' | 'ready' | 'error';
  progress: number;
}

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Генерация уникального ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Обработка перетаскивания НАД зоной
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Когда файл уводят С зоны
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Когда файл БРОСИЛИ в зону
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  // Когда выбрали файл через клик
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
      e.target.value = ''; // Сброс для повторной загрузки того же файла
    }
  };

  // Добавление файлов с начальным статусом
  const addFiles = (newFiles: File[]) => {
    const filesWithStatus: FileWithStatus[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      status: 'uploading',
      progress: 0,
    }));
    
    setFiles((prev) => [...prev, ...filesWithStatus]);
    
    // Имитация загрузки (в реальности тут будет API запрос)
    filesWithStatus.forEach((fileWithStatus) => {
      simulateUpload(fileWithStatus.id);
    });
  };

  // Имитация процесса загрузки и индексации
  const simulateUpload = (fileId: string) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Переход в статус "индексация"
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'indexing', progress: 100 } : f
          )
        );
        
        // Через 2 секунды — готово
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: 'ready', progress: 100 } : f
            )
          );
        }, 2000);
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress } : f
          )
        );
      }
    }, 200);
  };

  // Удаление файла из списка
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Клик по всей зоне
  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Остановка всплытия события
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Получение иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <MdHourglassEmpty size={20} className="status-icon status-icon--uploading" />;
      case 'indexing':
        return <MdHourglassEmpty size={20} className="status-icon status-icon--indexing" />;
      case 'ready':
        return <MdCheckCircle size={20} className="status-icon status-icon--ready" />;
      case 'error':
        return <MdError size={20} className="status-icon status-icon--error" />;
      default:
        return null;
    }
  };

  // Получение текста статуса
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'uploading':
        return 'Загрузка...';
      case 'indexing':
        return 'Индексация...';
      case 'ready':
        return 'Готово';
      case 'error':
        return 'Ошибка';
      default:
        return '';
    }
  };

  return (
    <div className="dropzone-container">
      {/* Зона Drag-and-Drop */}
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <div className="dropzone__icon">
          <MdCloudUpload size={64} />
        </div>

        <h3 className="dropzone__title">Перетащите PDF или DOCX файлы сюда</h3>
        <p className="dropzone__subtitle">или</p>

        <button
          className="dropzone__button"
          onClick={handleButtonClick}
          type="button"
        >
          Выбрать файлы
        </button>

        <p className="dropzone__hint">
          Поддерживаемые форматы: PDF, DOCX (до 20 МБ)
        </p>
      </div>

      {/* Список загруженных файлов */}
      {files.length > 0 && (
        <div className="files-list">
          <h4 className="files-list__title">
            📋 Загруженные файлы ({files.length})
          </h4>

          <div className="files-list__items">
            {files.map((fileWithStatus) => (
              <div key={fileWithStatus.id} className="file-item">
                <div className="file-item__info">
                  <MdInsertDriveFile size={24} className="file-item__icon" />
                  
                  <div className="file-item__details">
                    <div className="file-item__name">{fileWithStatus.file.name}</div>
                    <div className="file-item__meta">
                      {formatFileSize(fileWithStatus.file.size)} • {getStatusText(fileWithStatus.status)}
                    </div>
                  </div>

                  {getStatusIcon(fileWithStatus.status)}
                </div>

                {/* Прогресс-бар */}
                {(fileWithStatus.status === 'uploading' || fileWithStatus.status === 'indexing') && (
                  <div className="file-item__progress">
                    <div
                      className="file-item__progress-bar"
                      style={{ width: `${fileWithStatus.progress}%` }}
                    />
                  </div>
                )}

                <button
                  className="file-item__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileWithStatus.id);
                  }}
                  title="Удалить"
                  type="button"
                >
                  <MdClose size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}