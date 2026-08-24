import { ComplexityEngine } from '../src/analyzer/complexityEngine';

describe('ComplexityEngine - behavior coverage', () => {
  const analyze = (code: string, file = 'file.ts', language = 'typescript') =>
    new ComplexityEngine().analyzeCode(code, file, language);

  test('analisa funções arrow, expressão e método', () => {
    const result = analyze(`
      const arrow = (n) => { for (let i = 0; i < n; i++) {} };
      const expression = function (n) { while (n > 0) { n--; } };
      class Example { method(n) { for (let i = 0; i < n; i++) {} } }
    `);

    expect(result.functions.map((fn) => fn.functionName)).toEqual([
      'arrow',
      'expression',
      'method',
    ]);
  });

  test('escolhe o maior custo entre laços independentes', () => {
    const result = analyze(`
      function work(n) {
        for (let i = 0; i < n; i++) {}
        for (let i = 0; i < n; i *= 2) {}
      }
    `);

    expect(result.functions[0].timeComplexity).toBe('O(n)');
  });

  test('reconhece for-of e for-in como laços lineares', () => {
    const result = analyze(`
      function iterate(items, object) {
        for (const item of items) console.log(item);
        for (const key in object) console.log(key);
      }
    `);

    expect(result.functions[0].timeComplexity).toBe('O(n)');
    expect(result.functions[0].annotations).toHaveLength(2);
  });

  test('reconhece laço com limite sqrt(n)', () => {
    const result = analyze(`
      function roots(n) {
        for (let i = 0; i * i < n; i++) {}
      }
    `);

    expect(result.functions[0].timeComplexity).toBe('O(sqrt n)');
  });

  test('identifica espaço auxiliar de vetor e matriz', () => {
    const vector = analyze(`function vector(n) { return new Array(n).fill(0); }`);
    const matrix = analyze(`function matrix(n) { return new Array(n).map(() => new Array(n)); }`);

    expect(vector.functions[0].spaceComplexity).toBe('O(n)');
    expect(matrix.functions[0].spaceComplexity).toBe('O(n^2)');
  });

  test('retorna arquivo sem funções para código vazio', () => {
    expect(analyze('   ').functions).toEqual([]);
  });

  test('normaliza aliases por extensão', () => {
    const result = analyze(`def run(n):\n    for i in range(n):\n        pass`, 'script.py', 'plaintext');

    expect(result.functions[0].functionName).toBe('run');
    expect(result.functions[0].timeComplexity).toBe('O(n)');
  });

  test('não mistura laços de funções aninhadas na função externa', () => {
    const result = analyze(`
      function outer() {
        function inner(n) { for (let i = 0; i < n; i++) {} }
        return 1;
      }
    `);

    expect(result.functions.find((fn) => fn.functionName === 'outer')?.timeComplexity).toBe('O(1)');
  });

  test('não classifica chamada de função aninhada como recursão externa', () => {
    const result = analyze(`
      function outer(n) {
        function inner(value) { return outer(value - 1); }
        return 1;
      }
    `);

    expect(result.functions.find((fn) => fn.functionName === 'outer')?.isRecursive).toBe(false);
  });

  test('ignora autochamada escrita apenas em comentário Python', () => {
    const result = analyze(`
def process(n):
    # process(n - 1)
    return n
    `, 'script.py', 'python');

    expect(result.functions[0].isRecursive).toBe(false);
  });

  test('não trata texto comum como recursão Ruby', () => {
    const result = analyze(`
def process
  puts "process"
end
    `, 'script.rb', 'ruby');

    expect(result.functions[0].isRecursive).toBe(false);
  });

  test('retorna complexidade desconhecida para limite de laço não inferível', () => {
    const result = analyze(`
      function process(n) {
        for (let i = 0; i < getLimit(n); i++) {}
      }
    `);

    expect(result.functions[0].timeComplexity).toBe('O(desconhecido)');
  });
});
