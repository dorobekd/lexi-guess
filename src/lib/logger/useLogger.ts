'use client';

import { useMemo } from 'react';
import { withComponentContext } from './';
import type { Logger } from './types';

export function useLogger(componentName: string): Logger {
  return useMemo(
    () => withComponentContext(componentName),
    [componentName]
  );
} 