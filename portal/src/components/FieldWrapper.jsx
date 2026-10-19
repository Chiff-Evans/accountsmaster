/**
 * Renders a form field with the label floating on the top border.
 * Wrap a <Form.Item> (with no label prop) inside this.
 */
export default function FieldWrapper({ label, required, children, style }) {
  return (
    <div style={{
      position: 'relative',
      border: '1px solid #d9d9d9',
      borderRadius: 8,
      padding: '5px 12px 4px',
      marginBottom: 16,
      background: '#fff',
      ...style,
    }}>
      <span style={{
        position: 'absolute', top: -9, left: 10,
        background: '#fff', padding: '0 4px',
        fontSize: 12, color: 'rgba(0,0,0,0.45)',
        lineHeight: 1, fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {required && <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>}
        {label}
      </span>
      {children}
    </div>
  );
}
