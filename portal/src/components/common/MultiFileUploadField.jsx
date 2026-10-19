import { useRef, useState, useMemo } from 'react';
import { Typography, message, Image } from 'antd';
import {
  InboxOutlined, CloseCircleOutlined, FileImageOutlined, FilePdfOutlined,
  FileWordOutlined, FileExcelOutlined, FilePptOutlined, FileZipOutlined,
  FileTextOutlined, FileUnknownOutlined,
} from '@ant-design/icons';

const ICON_BY_EXT = {
  jpg: FileImageOutlined, jpeg: FileImageOutlined, png: FileImageOutlined, gif: FileImageOutlined, webp: FileImageOutlined,
  pdf: FilePdfOutlined,
  doc: FileWordOutlined, docx: FileWordOutlined,
  xls: FileExcelOutlined, xlsx: FileExcelOutlined, csv: FileExcelOutlined,
  ppt: FilePptOutlined, pptx: FilePptOutlined,
  zip: FileZipOutlined, rar: FileZipOutlined,
  txt: FileTextOutlined,
};
function iconFor(name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  return ICON_BY_EXT[ext] || FileUnknownOutlined;
}

/* One object URL per File for the lifetime of the field — created lazily and
   reused across re-renders instead of minting a new blob URL on every paint. */
function useObjectUrls(files) {
  const cache = useRef(new Map());
  return useMemo(() => files.map(f => {
    let url = cache.current.get(f);
    if (!url) { url = URL.createObjectURL(f); cache.current.set(f, url); }
    return url;
  }), [files]);
}

/* Drag-and-drop multi-file picker. Renders either an image thumbnail grid
   (imageGrid, with a click-to-zoom gallery) or a filename list with type
   icons and a click-to-open preview — for the two shapes every
   posters/attachments field in this app already uses (existing uploaded
   URLs + newly-picked Files, tracked separately by the parent). */
export default function MultiFileUploadField({
  existingItems = [], onRemoveExisting,
  files = [], onAddFiles, onRemoveFile,
  accept, maxSizeMB = 10, maxCount = 10, imageGrid = false, hint, disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const total = existingItems.length + files.length;
  const fileUrls = useObjectUrls(files);

  const validateAndAdd = fileList => {
    const incoming = Array.from(fileList || []);
    const room = maxCount - total;
    if (room <= 0) return message.warning(`You can attach up to ${maxCount} files`);
    const accepted = [];
    incoming.slice(0, room).forEach(f => {
      if (accept === 'image/*' && !f.type.startsWith('image/')) { message.error(`${f.name}: only images are allowed`); return; }
      if (f.size > maxSizeMB * 1024 * 1024) { message.error(`${f.name}: must be under ${maxSizeMB}MB`); return; }
      accepted.push(f);
    });
    if (incoming.length > room) message.warning(`Only ${room} more file(s) can be added (max ${maxCount})`);
    if (accepted.length) onAddFiles(accepted);
  };

  return (
    <div>
      <input
        ref={inputRef} type="file" accept={accept} multiple style={{ display: 'none' }}
        onChange={e => { validateAndAdd(e.target.files); e.target.value = ''; }}
      />
      {!disabled && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); validateAndAdd(e.dataTransfer.files); }}
          style={{
            border: `1.5px dashed ${dragOver ? '#1677ff' : '#d9d9d9'}`,
            background: dragOver ? '#e6f4ff' : '#fafafa', borderRadius: 8,
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', marginBottom: 12, transition: 'border-color .15s, background .15s',
          }}
        >
          <InboxOutlined style={{ fontSize: 18, color: '#1677ff' }} />
          <span style={{ fontSize: 12.5, color: '#666' }}>
            Click or drag {imageGrid ? 'images' : 'files'} here ({total}/{maxCount})
          </span>
        </div>
      )}

      {imageGrid ? (
        <Image.PreviewGroup>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {existingItems.map((it, i) => (
              <Thumb key={`e${i}`} src={it.url} onRemove={onRemoveExisting && !disabled ? () => onRemoveExisting(i) : null} />
            ))}
            {files.map((f, i) => (
              <Thumb key={`n${i}`} src={fileUrls[i]} onRemove={!disabled ? () => onRemoveFile(i) : null} />
            ))}
          </div>
        </Image.PreviewGroup>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {existingItems.map((it, i) => (
            <FileRow key={`e${i}`} name={it.name} href={it.url} onRemove={onRemoveExisting && !disabled ? () => onRemoveExisting(i) : null} />
          ))}
          {files.map((f, i) => (
            <FileRow key={`n${i}`} name={f.name} href={fileUrls[i]} onRemove={!disabled ? () => onRemoveFile(i) : null} />
          ))}
        </div>
      )}
      {hint && <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div style={{ position: 'relative', width: 72, height: 72 }}>
      <Image
        src={src} width={72} height={72}
        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
      />
      {onRemove && (
        <CloseCircleOutlined
          style={{ position: 'absolute', top: -6, right: -6, background: '#fff', borderRadius: '50%', color: '#cf1322', cursor: 'pointer', zIndex: 2 }}
          onClick={onRemove}
        />
      )}
    </div>
  );
}

function FileRow({ name, href, onRemove }) {
  const Icon = iconFor(name || '');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: '#fafafa', borderRadius: 6 }}>
      <Icon style={{ color: '#1677ff', flexShrink: 0 }} />
      {href
        ? <a href={href} target="_blank" rel="noreferrer" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</a>
        : <Typography.Text style={{ flex: 1 }} ellipsis>{name}</Typography.Text>}
      {onRemove && <CloseCircleOutlined onClick={onRemove} style={{ color: '#cf1322', cursor: 'pointer', flexShrink: 0 }} />}
    </div>
  );
}
