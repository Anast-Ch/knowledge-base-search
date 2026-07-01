import React, { useRef, useState } from 'react';
import { FiFolder, FiUpload } from 'react-icons/fi';
import './DropZone.css';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    onFilesAdded(filesArray);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="drop-zone-content">
        <FiFolder className="drop-icon" />
        <p className="drop-text">Перетащите PDF или DOCX файлы сюда</p>
        <span className="drop-or">или</span>
        <button
          className="btn-primary drop-btn"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <FiUpload />
          ВЫБРАТЬ ФАЙЛЫ
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <p className="drop-hint">Максимальный размер: 20 МБ</p>
      </div>
    </div>
  );
};

export default DropZone;