import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DropZone from '../components/DropZone';
import FileList from '../components/FileList';
import './UploadPage.css';

// Тип для файла
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

  return (
    <>
      <Navigation />
      <main className="upload-page">
        <div className="container upload-inner">
          <h1 className="upload-title">ЗАГРУЗКА ДОКУМЕНТОВ</h1>
          <DropZone onFilesAdded={handleFilesAdded} />
          <FileList files={files} />
          <button
            className="btn-secondary ready-btn"
            onClick={() => navigate('/documents')}
          >
            ГОТОВО
          </button>
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