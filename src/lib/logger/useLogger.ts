'use client';

import { useMemo } from 'react';
import { withComponentContext } from './';
import type { Logger } from 'winston';

export function useLogger(componentName: string): Logger {
  return useMemo(
    () => withComponentContext(componentName),
    [componentName]
  );
} 