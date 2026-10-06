# SSMS Table Converter

A lightweight VS Code extension to convert tabular TSV data copied from **SQL Server Management Studio (SSMS)** into **JSON Array**, **JSON Lines**, or a **JavaScript Array** directly inside your editor.

## Features

- **In-place Replacement**: Replaces selected text (or the entire document if nothing is selected) with the converted output.
- **Formats Supported**:
  - **JSON Array**: Full JSON array `[ ... ]` with commas separating objects and clean indentation.
  - **JSON Lines**: Individual JSON object per line (`.jsonl` format).
  - **JavaScript Array**: `const data = [ ... ];` with unquoted object keys where valid.
- **Smart Type Conversion**:
  - Converts `NULL` to `null`.
  - Converts numbers (integers, floats) to numeric values.
  - Keeps strings properly escaped.
  - Preserves IDs / codes with leading zeros as strings (e.g., `00123`).
- **Context Menu & Command Palette**:
  - Right-click in the editor to access the **SSMS Table Converter** submenu.
  - Accessible from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).

---

## How to Use

1. Paste your SSMS table data into an editor window in VS Code.
2. Select the TSV text you want to convert (or leave unselected to convert the entire document).
3. **Run the command**:
   - **Right-click** in the editor -> **SSMS Table Converter** -> choose **Convert to JSON Array**, **Convert to JSON Lines**, or **Convert to JavaScript Array**.
   - Or open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for `SSMS Table Converter`.
4. The text in the editor will be replaced with the converted format.

---

## Examples

### Input (TSV)

```tsv
PTO_CODIGO	PTO_DESCRI
147	KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)
149	KLA. PASTINA X 1 KGS. BLENDA
```

### 1. JSON Array Output (with commas & root `[...]`)

```json
[
  {
    "PTO_CODIGO": 147,
    "PTO_DESCRI": "KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)"
  },
  {
    "PTO_CODIGO": 149,
    "PTO_DESCRI": "KLA. PASTINA X 1 KGS. BLENDA"
  }
]
```

### 2. JSON Lines Output

```json
{"PTO_CODIGO":147,"PTO_DESCRI":"KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)"}
{"PTO_CODIGO":149,"PTO_DESCRI":"KLA. PASTINA X 1 KGS. BLENDA"}
```

### 3. JavaScript Array Output

```javascript
const data = [
  {
    PTO_CODIGO: 147,
    PTO_DESCRI: "KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)"
  },
  {
    PTO_CODIGO: 149,
    PTO_DESCRI: "KLA. PASTINA X 1 KGS. BLENDA"
  }
];
```

---

## Commands

| Command | Title | Description |
|---|---|---|
| `ssms-table-converter.toJsonArray` | **SSMS Table Converter: Convert to JSON Array** | Replaces TSV table in the editor with a JSON Array `[...]` with commas. |
| `ssms-table-converter.toJsonLines` | **SSMS Table Converter: Convert to JSON Lines** | Replaces TSV table in the editor with JSON Lines. |
| `ssms-table-converter.toJsArray` | **SSMS Table Converter: Convert to JavaScript Array** | Replaces TSV table in the editor with a JavaScript Array `const data = [...]`. |

---

## Development

Requirements: Node.js and npm, plus Visual Studio Code to run the extension.

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Build an installable VS Code extension package
npm run package
```

To try the extension during development, open this folder in VS Code, press `F5`, and use the Extension Development Host window. The packaging command creates a `.vsix` file in the project root; generated packages are not committed.

## Data
Created with GOOGLE ANTIGRAVITY