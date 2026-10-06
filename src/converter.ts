/**
 * Type to represent a parsed row record
 */
export type TableRecord = Record<string, string | number | null>;

/**
 * Converts a raw cell string into an appropriate JS/JSON primitive value.
 * - 'NULL' (case-insensitive) -> null
 * - Valid integer or decimal numbers -> number
 * - Everything else -> string
 */
export function parseCellValue(rawVal: string): string | number | null {
  const trimmed = rawVal.trim();

  // SSMS exports NULL as "NULL"
  if (trimmed.toUpperCase() === 'NULL') {
    return null;
  }

  // Handle empty string
  if (rawVal === '') {
    return '';
  }

  // Check for obvious numbers:
  // Examples: 147, -147, 0, 0.5, -3.14, 1000
  // Avoid converting leading zeros like "00123" to numbers (often IDs/codes)
  const isNumber = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(trimmed);
  if (isNumber) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      return num;
    }
  }

  return rawVal;
}

/**
 * Parses TSV string into an array of objects.
 */
export function parseTsv(tsvContent: string): TableRecord[] {
  if (!tsvContent || !tsvContent.trim()) {
    throw new Error('Text is empty or contains only whitespace.');
  }

  // Split into lines, handling CRLF and LF
  const rawLines = tsvContent.split(/\r?\n/);
  // Filter out trailing empty lines
  const lines = rawLines.filter((line, index) => {
    // Keep lines unless it's an empty line at the end
    if (index === rawLines.length - 1 && line.trim() === '') {
      return false;
    }
    return true;
  });

  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
    throw new Error('No data found to convert.');
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = headerLine.split('\t').map((h) => h.trim());

  if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
    throw new Error('No valid column headers found in the first row.');
  }

  if (lines.length < 2) {
    throw new Error('No data rows found below the header row.');
  }

  const records: TableRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // If it's a completely empty line at the bottom, skip
    if (line.trim() === '') {
      continue;
    }

    const cells = line.split('\t');
    const record: TableRecord = {};

    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const headerName = headers[colIdx] || `Column_${colIdx + 1}`;
      const cellVal = colIdx < cells.length ? cells[colIdx] : '';
      record[headerName] = parseCellValue(cellVal);
    }

    records.push(record);
  }

  if (records.length === 0) {
    throw new Error('No valid data rows could be parsed.');
  }

  return records;
}

/**
 * Converts records to standard JSON Array format with main array wrapper and commas.
 */
export function toJsonArray(records: TableRecord[], space: number = 2): string {
  return JSON.stringify(records, null, space);
}

/**
 * Converts records to JSON Lines format (one JSON object per line).
 */
export function toJsonLines(records: TableRecord[]): string {
  return records.map((record) => JSON.stringify(record)).join('\n');
}

/**
 * Converts records to a formatted JavaScript Array assignment with main array and commas.
 */
export function toJsArray(records: TableRecord[]): string {
  const formattedItems = records.map((record) => {
    const lines = Object.entries(record).map(([key, val]) => {
      // If the key is a standard valid JS identifier, keep unquoted, else quote it
      const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? key
        : JSON.stringify(key);
      const formattedVal = JSON.stringify(val);
      return `    ${formattedKey}: ${formattedVal}`;
    });

    return `  {\n${lines.join(',\n')}\n  }`;
  });

  return `const data = [\n${formattedItems.join(',\n')}\n];`;
}
