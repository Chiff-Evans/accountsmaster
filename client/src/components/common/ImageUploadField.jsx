import { useRef, useState } from 'react';
import { Button, message, Image } from 'antd';
import { InboxOutlined, SwapOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

/* Drag-and-drop single-image picker with a hover-to-preview/replace/remove
   thumbnail. Stays "dumb" about persistence — it only ever hands the parent
   a validated File via onChange; the parent still owns preview/selectedFile
   state exactly as before, so existing save/edit flows don't need to change. */
export default function ImageUploadField({
  value, onChange, onRemove, accept = 'image/*', maxSizeMB = 5,
  shape = 'square', size = 100, hint, disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const validate = file => {
    if (accept.includes('image') && !file.type.startsWith('image/')) {
      message.error('Only image files (JPG, PNG, WEBP, GIF) are allowed');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      message.error(`Image must be under ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const pick = fileList => {
    const file = fileList?.[0];
    if (!file || !validate(file)) return;
    onChange(file);
  };

  const radius = shape === 'circle' ? '50%' : 8;

  return (
    <div>
      <input
        ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
        onChange={e => { pick(e.target.files); e.target.value = ''; }}
      />
      {value ? (
        <div
          onClick={() => !disabled && setPreviewOpen(true)}
          style={{
            position: 'relative', width: size, height: size, borderRadius: radius,
            overflow: 'hidden', border: '1px solid #e5e7eb', cursor: 'pointer',
          }}
          onMouseEnter={e => { const o = e.currentTarget.querySelector('.iuf-overlay'); if (o) o.style.opacity = 1; }}
          onMouseLeave={e => { const o = e.currentTarget.querySelector('.iuf-overlay'); if (o) o.style.opacity = 0; }}
        >
          <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Hidden trigger — antd's own preview mask/click handling is
              suppressed (we drive it with our own overlay buttons below) but
              its lightbox (zoom/rotate/download) is reused via the visible prop. */}
          <Image src={value} style={{ display: 'none' }} preview={{ visible: previewOpen, onVisibleChange: setPreviewOpen }} />
          <div className="iuf-overlay" style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', opacity: 0,
            transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Button size="small" shape="circle" icon={<EyeOutlined />} title="Preview"
              onClick={e => { e.stopPropagation(); setPreviewOpen(true); }} />
            {!disabled && (
              <Button size="small" shape="circle" icon={<SwapOutlined />} title="Replace"
                onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} />
            )}
            {!disabled && onRemove && (
              <Button size="small" shape="circle" danger icon={<DeleteOutlined />} title="Remove"
                onClick={e => { e.stopPropagation(); onRemove(); }} />
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); if (!disabled) pick(e.dataTransfer.files); }}
          style={{
            width: Math.max(size, 160), minHeight: 90, borderRadius: 8,
            border: `1.5px dashed ${dragOver ? '#1677ff' : '#d9d9d9'}`,
            background: dragOver ? '#e6f4ff' : '#fafafa',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: 16, cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'center',
            transition: 'border-color .15s, background .15s',
          }}
        >
          <InboxOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <span style={{ fontSize: 12, color: '#666' }}>Click or drag image here</span>
        </div>
      )}
      {hint && <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{hint}</div>}
    </div>
  );
}
