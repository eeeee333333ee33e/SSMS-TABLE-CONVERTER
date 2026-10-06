import * as vscode from 'vscode';
import { parseTsv, toJsonArray, toJsonLines, toJsArray } from './converter';

export type ConversionFormat = 'jsonArray' | 'jsonLines' | 'jsArray';

/**
 * Handles reading TSV text from the active editor (selected text or entire document)
 * and replacing it with the converted format.
 */
async function handleConversion(format: ConversionFormat): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage('SSMS Table Converter: No active editor found.');
    return;
  }

  const document = editor.document;
  const selections = editor.selections;

  // Determine if there is at least one non-empty selection
  const hasSelection = selections.some((s) => !s.isEmpty);

  try {
    let totalRows = 0;
    let formatLabel = 'JSON Array';
    if (format === 'jsonLines') {
      formatLabel = 'JSON Lines';
    } else if (format === 'jsArray') {
      formatLabel = 'JavaScript Array';
    }

    const formatRecord = (records: any[]) => {
      switch (format) {
        case 'jsonArray':
          return toJsonArray(records);
        case 'jsonLines':
          return toJsonLines(records);
        case 'jsArray':
          return toJsArray(records);
      }
    };

    if (hasSelection) {
      // Convert each non-empty selection
      const edits: { range: vscode.Range; newText: string }[] = [];

      for (const selection of selections) {
        if (selection.isEmpty) {
          continue;
        }

        const sourceText = document.getText(selection);
        if (!sourceText.trim()) {
          continue;
        }

        const records = parseTsv(sourceText);
        totalRows += records.length;

        const converted = formatRecord(records);
        edits.push({ range: selection, newText: converted });
      }

      if (edits.length === 0) {
        vscode.window.showErrorMessage('SSMS Table Converter: Selected text is empty or contains no valid data.');
        return;
      }

      const success = await editor.edit((editBuilder) => {
        for (const edit of edits) {
          editBuilder.replace(edit.range, edit.newText);
        }
      });

      if (!success) {
        vscode.window.showErrorMessage('SSMS Table Converter: Could not apply edits to the document.');
        return;
      }
    } else {
      // No selection: convert the entire document
      const fullText = document.getText();
      if (!fullText.trim()) {
        vscode.window.showErrorMessage('SSMS Table Converter: Document is empty or contains no text.');
        return;
      }

      const records = parseTsv(fullText);
      totalRows = records.length;

      const converted = formatRecord(records);

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length)
      );

      const success = await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, converted);
      });

      if (!success) {
        vscode.window.showErrorMessage('SSMS Table Converter: Could not apply edits to the document.');
        return;
      }
    }

    const rowCountText = `${totalRows} ${totalRows === 1 ? 'row' : 'rows'}`;
    vscode.window.showInformationMessage(
      `SSMS Table Converter: Converted ${rowCountText} to ${formatLabel}.`
    );
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`SSMS Table Converter: ${message}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const jsonArrayCommand = vscode.commands.registerCommand(
    'ssms-table-converter.toJsonArray',
    async () => {
      await handleConversion('jsonArray');
    }
  );

  const jsonLinesCommand = vscode.commands.registerCommand(
    'ssms-table-converter.toJsonLines',
    async () => {
      await handleConversion('jsonLines');
    }
  );

  const jsArrayCommand = vscode.commands.registerCommand(
    'ssms-table-converter.toJsArray',
    async () => {
      await handleConversion('jsArray');
    }
  );

  context.subscriptions.push(jsonArrayCommand, jsonLinesCommand, jsArrayCommand);
}

export function deactivate() {}
