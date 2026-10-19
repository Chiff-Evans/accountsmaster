import { Spin, Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { usePagePermissions } from '../../hooks/usePagePermissions';

export default function PermissionGuard({ children }) {
  const { canView } = usePagePermissions();
  const navigate = useNavigate();

  // null = permissions still loading — show spinner to prevent content flash
  if (canView === null) {
    return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  }

  if (!canView) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You do not have permission to view this page. Contact your administrator if you believe this is a mistake."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />
    );
  }

  return children;
}
