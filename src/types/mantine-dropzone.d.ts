declare module '@mantine/dropzone' {
  import React from 'react';

  export interface DropzoneProps extends React.ComponentPropsWithoutRef<'div'> {
    children: React.ReactNode;
    onDrop?: (files: File[]) => void;
    onReject?: (files: { file: File; errors: { message: string; code: string }[] }[]) => void;
    maxSize?: number;
    accept?: string | string[];
    multiple?: boolean;
    disabled?: boolean;
    loading?: boolean;
    openRef?: React.ForwardedRef<() => void | undefined>;
    activateOnClick?: boolean;
    activateOnDrag?: boolean;
    dragEventsBubbling?: boolean;
    activateOnKeyboard?: boolean;
    onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
    radius?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    padding?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    style?: React.CSSProperties;
  }

  export interface FileWithPath extends File {
    path?: string;
  }

  export function Dropzone(props: DropzoneProps): JSX.Element;

  export namespace Dropzone {
    function Accept(props: { children: React.ReactNode }): JSX.Element;
    function Reject(props: { children: React.ReactNode }): JSX.Element;
    function Idle(props: { children: React.ReactNode }): JSX.Element;
  }
} 