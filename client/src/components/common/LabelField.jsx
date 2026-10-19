export default function LabelField({ label, required, hidden, children }) {
  return (
    <div style={{ position: 'relative', display: hidden ? 'none' : 'flow-root', marginBottom: 8 }}>
      <span style={{
        position: 'absolute',
        top: -9,
        left: 11,
        zIndex: 2,
        background: '#ffffff',
        padding: '0 4px',
        fontSize: 11,
        color: 'rgba(0,0,0,0.45)',
        lineHeight: '16px',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {required && <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>}
        {label}
      </span>
      {children}
    </div>
  );
}
