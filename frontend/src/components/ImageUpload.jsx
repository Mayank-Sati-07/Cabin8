import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

export default function ImageUpload({ value, onChange, label = 'Upload Image' }) {
  const [preview, setPreview] = useState(value || '');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onChange?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    onChange?.('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`image-upload ${preview ? 'has-image' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview ? (
        <div className="preview-container">
          <img src={preview} alt="Preview" />
          <button className="remove-preview" onClick={handleRemove} aria-label="Remove image">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="upload-placeholder">
          <Upload />
          <p>{label}</p>
          <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  );
}
