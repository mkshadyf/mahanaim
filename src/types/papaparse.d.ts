declare namespace Papa {
  interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    fastMode?: boolean;
    withCredentials?: boolean;
    step?: (results: ParseStepResult, parser: Parser) => void;
    complete?: (results: ParseResult<any>, file: File) => void;
    error?: (error: Error, file: File) => void;
    chunk?: (results: ParseResult<any>, parser: Parser) => void;
    beforeFirstChunk?: (chunk: string) => string | void;
    transform?: (value: string, field: string | number) => any;
    delimitersToGuess?: string[];
  }

  interface ParseResult<T = any> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  interface ParseStepResult {
    data: any[][];
    errors: ParseError[];
    meta: ParseMeta;
  }

  interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
    index: number;
  }

  interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    fields: string[];
    truncated: boolean;
    cursor: number;
  }

  interface Parser {
    abort: () => void;
    pause: () => void;
    resume: () => void;
  }

  function parse(input: string | File | NodeJS.ReadableStream, config?: ParseConfig): ParseResult;
  function unparse(data: any[][], config?: any): string;
  function unparse(data: object[], config?: any): string;
}

declare module 'papaparse' {
  export = Papa;
} 