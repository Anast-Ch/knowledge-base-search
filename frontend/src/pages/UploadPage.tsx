import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DropZone from '../components/DropZone';
import FileList from '../components/FileList';
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

  const handleFilesAdded = (newFiles: File[]) => {
    const newFileItems: UploadFile[] = newFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      status: 'loading' as const,
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFileItems]);

    newFileItems.forEach((fileItem) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'ready' as const, progress: 100 } : f
          ));
        } else {
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        }
      }, 300);
    });
  };

  const handleRemoveFile = (id: number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <>
      <Navigation />
      <main className="upload-page">
        <div className="container upload-container">
          {/* ЗАГОЛОВОК — с отступом сверху */}
          <h1 className="upload-title">ЗАГРУЗКА ДОКУМЕНТОВ</h1>
          
          {/* DROP ZONE — фиксированного размера */}
          <div className="dropzone-wrapper">
            <DropZone onFilesAdded={handleFilesAdded} />
          </div>
          
          {/* СПИСОК ФАЙЛОВ */}
          <FileList files={files} onRemoveFile={handleRemoveFile} />
          
          {/* КНОПКА "ГОТОВО" — центрирована */}
          <div className="ready-wrapper">
            <button
              className="btn-secondary ready-btn"
              onClick={() => navigate('/documents')}
            >
              ГОТОВО
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