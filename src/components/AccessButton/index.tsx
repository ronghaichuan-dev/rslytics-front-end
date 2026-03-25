import { useAccess } from '@umijs/max';
import { Button, ButtonProps } from 'antd';

interface AccessButtonProps extends ButtonProps {
  permissionCode: string;
}

export default function AccessButton({
  permissionCode,
  children,
  ...buttonProps
}: AccessButtonProps) {
  const access = useAccess();
  if (!access.can(permissionCode)) return null;
  return <Button {...buttonProps}>{children}</Button>;
}
