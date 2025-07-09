declare module 'react' {
  export type ReactNode = any;
  export type FC<P = any> = (props: any) => any;
  export function useState<T>(initial: T): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initial: T): { current: T };
  export function memo(component: any): any;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;
  export const StrictMode: FC<{ children?: ReactNode }>;
  const React: {
    useState: typeof useState;
    useEffect: typeof useEffect;
    useRef: typeof useRef;
    memo: typeof memo;
    useCallback: typeof useCallback;
    StrictMode: typeof StrictMode;
  };
  export default React;
  export = React;
  export as namespace React;
  export interface ChangeEvent<T = any> extends Event { target: T; }
  export interface MouseEvent<T = any> extends Event { target: T; }
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prev: S) => S);
}

declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: any;
  }
}

declare module 'react-dom/client' {
  const createRoot: any;
  export { createRoot };
}

declare module 'react-dom';
declare module 'react-router-dom';
declare module 'lucide-react';
declare module 'pdfjs-dist';
declare module 'pdfjs-dist/types/src/display/api' {
  export type PDFDocumentProxy = any;
  export type PDFPageProxy = any;
  export type TextItem = any;
  export type TextContent = any;
  export interface RenderParameters { [key: string]: any }
}
declare module 'pdfjs-dist/types/src/display/text_layer' {
  export interface TextLayerParameters { [key: string]: any }
}
declare module '@google/genai';
declare module 'vite';
declare module '@vitejs/plugin-react';
declare module 'path';
declare module 'react/jsx-runtime';
declare module 'vite/client';
declare module 'node';

interface ImportMeta {
  env: Record<string, string>;
}

declare var process: {
  cwd: () => string;
  env: Record<string, string | undefined>;
};
