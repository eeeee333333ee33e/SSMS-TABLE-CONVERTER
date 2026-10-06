import * as assert from 'assert';
import { parseTsv, parseCellValue, toJsonArray, toJsonLines, toJsArray } from '../converter';

function runTests() {
  console.log('Running converter tests...');

  // Test 1: Cell value parsing
  assert.strictEqual(parseCellValue('NULL'), null, 'NULL should parse to null');
  assert.strictEqual(parseCellValue('null'), null, 'null (lowercase) should parse to null');
  assert.strictEqual(parseCellValue(' 147 '), 147, '147 with spaces should parse to number 147');
  assert.strictEqual(parseCellValue('-149.50'), -149.5, 'Decimal should parse to number');
  assert.strictEqual(parseCellValue('0'), 0, '0 should parse to number 0');
  assert.strictEqual(parseCellValue('0147'), '0147', 'Leading zero string should remain string');
  assert.strictEqual(
    parseCellValue('KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)'),
    'KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)',
    'String should remain string'
  );

  // Test 2: Sample TSV from user request
  const sampleTsv = `PTO_CODIGO\tPTO_DESCRI\r\n147\tKLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)\r\n149\tKLA. PASTINA X 1 KGS. BLENDA`;
  const records = parseTsv(sampleTsv);

  assert.strictEqual(records.length, 2, 'Should have 2 records');
  assert.deepStrictEqual(records[0], {
    PTO_CODIGO: 147,
    PTO_DESCRI: 'KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)',
  });
  assert.deepStrictEqual(records[1], {
    PTO_CODIGO: 149,
    PTO_DESCRI: 'KLA. PASTINA X 1 KGS. BLENDA',
  });

  // Test 3: JSON Array conversion (with main array wrapper and commas)
  const jsonArr = toJsonArray(records);
  const expectedJsonArr = `[
  {
    "PTO_CODIGO": 147,
    "PTO_DESCRI": "KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)"
  },
  {
    "PTO_CODIGO": 149,
    "PTO_DESCRI": "KLA. PASTINA X 1 KGS. BLENDA"
  }
]`;
  assert.strictEqual(jsonArr, expectedJsonArr, 'JSON Array output must match expected format');

  // Test 4: JSON Lines conversion
  const jsonl = toJsonLines(records);
  const expectedJsonl =
    '{"PTO_CODIGO":147,"PTO_DESCRI":"KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)"}\n' +
    '{"PTO_CODIGO":149,"PTO_DESCRI":"KLA. PASTINA X 1 KGS. BLENDA"}';
  assert.strictEqual(jsonl, expectedJsonl, 'JSON Lines output must match expected format');

  // Test 5: JavaScript Array conversion (with const data = [...])
  const jsArray = toJsArray(records);
  const expectedJsArray = `const data = [
  {
    PTO_CODIGO: 147,
    PTO_DESCRI: "KLA. PASTINA JUNTA ANCHA X 10 KGS. GABRO (NEGRA)"
  },
  {
    PTO_CODIGO: 149,
    PTO_DESCRI: "KLA. PASTINA X 1 KGS. BLENDA"
  }
];`;
  assert.strictEqual(jsArray, expectedJsArray, 'JS Array output must match expected format');

  // Test 6: NULL and special characters escaping
  const tsvWithNullAndQuotes = `ID\tNAME\tPRICE\tNOTES\n1\t"Item with quotes"\t29.99\tNULL\n2\tItem with \\backslashes\\\t-5\tSome note`;
  const records2 = parseTsv(tsvWithNullAndQuotes);
  assert.strictEqual(records2[0].NOTES, null);
  assert.strictEqual(records2[0].PRICE, 29.99);
  assert.strictEqual(records2[1].PRICE, -5);

  const jsonl2 = toJsonLines(records2);
  const parsedBackFromJsonl = jsonl2.split('\n').map((l) => JSON.parse(l));
  assert.deepStrictEqual(parsedBackFromJsonl, records2);

  // Test 7: Key names with spaces or special characters in JS Array
  const specialKeysTsv = `Col 1\tCol-2\tStandardCol\n10\t20\t30`;
  const records3 = parseTsv(specialKeysTsv);
  const jsArray3 = toJsArray(records3);
  assert.ok(jsArray3.includes('"Col 1": 10'), 'Keys with spaces should be quoted');
  assert.ok(jsArray3.includes('"Col-2": 20'), 'Keys with hyphens should be quoted');
  assert.ok(jsArray3.includes('StandardCol: 30'), 'Standard keys should be unquoted');

  console.log('All converter tests passed successfully!');
}

runTests();
