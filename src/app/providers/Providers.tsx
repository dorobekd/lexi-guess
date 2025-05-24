import { ReactNode } from 'react';
import { ConfigProvider } from './ConfigProvider';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>
  );
} 