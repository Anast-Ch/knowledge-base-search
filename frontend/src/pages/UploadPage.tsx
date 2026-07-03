import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DropZone from '../components/DropZone';
import FileList from '../components/FileList';
import { uploadDocument } from '../services/api';
import './UploadPage.css';

interface UploadFile {
  id: number;
  name: string;
  status: 'loading' | 'indexing' | 'ready' | 'error';
  progress?: number;
}

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesAdded = async (newFiles: File[]) => {
    // Создаём записи для каждого файла со статусом "loading"
    const newFileItems: UploadFile[] = newFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      status: 'loading',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFileItems]);
    setIsUploading(true);

    // Загружаем каждый файл последовательно
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileItem = newFileItems[i];

      try {
        // Отправляем файл на сервер
        const result = await uploadDocument(file);

        // Обновляем статус на "ready"
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: 'ready', progress: 100 }
              : f
          )
        );
        console.log('Файл загружен:', result);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'error' } : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleRemoveFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <>
      <Navigation />
      <main className="upload-page">
        <div className="container upload-container">
          <h1 className="upload-title">ЗАГРУЗКА ДОКУМЕНТОВ</h1>
          <div className="dropzone-wrapper">
            <DropZone onFilesAdded={handleFilesAdded} />
          </div>
          <FileList files={files} onRemoveFile={handleRemoveFile} />
          <div className="ready-wrapper">
            <button
              className="btn-secondary ready-btn"
              onClick={() => navigate('/documents')}
              disabled={isUploading}
            >
              {isUploading ? 'ЗАГРУЗКА...' : 'ГОТОВО'}
            </button>
          </div>
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

export default UploadPage;