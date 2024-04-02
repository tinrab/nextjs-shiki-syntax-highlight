import { Element } from 'hast';

export type MdxCodeMeta = {
  highlight?: MdxCodeHighlightLine;
  commandLine?: MdxCodeCommandLine;
  showLineNumbers?: MdxCodeShowLineNumbers;
  filename?: string;
};

export type MdxCodeHighlightLine = {
  lineNumbers: number[];
};

export type MdxCodeCommandLine = {
  outputLines: number[];
};

export type MdxCodeShowLineNumbers = {
  lineNumbers: number[];
};

type CodeMetaRaw = {
  highlight?: string;
  showLineNumbers?: string | boolean;
  commandLine?: string | boolean;
  filename?: string;
};

export function getCodeMeta(node: Element): MdxCodeMeta {
  const meta: string = (
    node?.data?.meta ??
    node?.properties?.metastring ??
    ''
  ).toString();
  let codeOptions: MdxCodeMeta = {};
  try {
    codeOptions = parseCodeMeta(meta);
  } catch {
    throw new Error(`Invalid code meta '${meta}'`);
  }
  return codeOptions;
}

function parseCodeMeta(meta: string): MdxCodeMeta {
  meta = meta.trim();
  if (meta.length === 0) {
    return {};
  }
  const parsed: CodeMetaRaw = JSON.parse(meta);

  const options: MdxCodeMeta = {};
  if (parsed.highlight !== undefined) {
    options.highlight = { lineNumbers: parseNumericRange(parsed.highlight) };
  }
  if (parsed.showLineNumbers !== undefined) {
    if (typeof parsed.showLineNumbers === 'string') {
      options.showLineNumbers = {
        lineNumbers: parseNumericRange(parsed.showLineNumbers),
      };
    } else if (parsed.showLineNumbers) {
      options.showLineNumbers = { lineNumbers: [] };
    }
  }
  if (parsed.commandLine !== undefined) {
    if (typeof parsed.commandLine === 'string') {
      options.commandLine = {
        outputLines: parseNumericRange(parsed.commandLine),
      };
    } else if (parsed.commandLine) {
      options.commandLine = { outputLines: [] };
    }
  }
  if (typeof parsed.filename === 'string') {
    options.filename = parsed.filename.trim();
  }

  return options;
}

function parseNumericRange(s: string): number[] {
  const values = new Set<number>();
  for (const part of s
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)) {
    if (/^-?\d+$/.test(part)) {
      values.add(Number.parseInt(part));
      continue;
    }
    const limits = part.split('..');
    if (limits.length !== 2) {
      throw new Error(`Invalid range '${s}'`);
    }
    const low = Number.parseInt(limits[0]);
    let inclusive = false;
    let high = Number.NaN;
    if (limits[1].startsWith('=')) {
      inclusive = true;
      high = Number.parseInt(limits[1].slice(1));
    } else {
      high = Number.parseInt(limits[1]);
    }
    if (low > high) {
      throw new Error(`Invalid range '${s}'`);
    }
    for (let i = low; i < (inclusive ? high + 1 : high); i++) {
      values.add(i);
    }
  }
  return Array.from(values);
}
