import { UniversalFunctionNode, UniversalLoopNode, UniversalCallNode } from '../types';

export class GoUniversalParser {
  public parse(code: string): UniversalFunctionNode[] {
    const lines = code.split(/\r?\n/);
    const functions: UniversalFunctionNode[] = [];

    let currentFn: {
      name: string;
      startLine: number;
      parameters: string[];
      bodyLines: { line: number; text: string }[];
    } | null = null;

    const topLevelLines: { line: number; text: string }[] = [];
    let fnBraceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      const trimmed = lineText.trim();
      const lineNum = i + 1;

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        continue;
      }

      if (!currentFn) {
        const funcMatch = trimmed.match(/^func\s+(?:\([^)]*\)\s*)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (funcMatch) {
          currentFn = {
            name: funcMatch[1],
            startLine: lineNum,
            parameters: funcMatch[2] ? funcMatch[2].split(',').map((p) => p.trim()).filter(Boolean) : [],
            bodyLines: [],
          };
          fnBraceDepth = (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          if (fnBraceDepth <= 0) {
            functions.push(this.buildFunctionNode(currentFn, lineNum));
            currentFn = null;
            fnBraceDepth = 0;
          }
          continue;
        }
        topLevelLines.push({ line: lineNum, text: trimmed });
      } else {
        currentFn.bodyLines.push({ line: lineNum, text: trimmed });
        const openB = (trimmed.match(/\{/g) || []).length;
        const closeB = (trimmed.match(/\}/g) || []).length;
        fnBraceDepth += openB - closeB;

        if (fnBraceDepth <= 0) {
          functions.push(this.buildFunctionNode(currentFn, lineNum));
          currentFn = null;
          fnBraceDepth = 0;
        }
      }
    }

    if (currentFn) {
      functions.push(this.buildFunctionNode(currentFn, lines.length));
    }

    const mainLoops = this.extractLoops(topLevelLines);
    if (mainLoops.length > 0 || functions.length === 0) {
      const scriptText = topLevelLines.map((l) => l.text).join('\n');
      const hasDivisionInBody =
        scriptText.includes('/ 2') ||
        scriptText.includes('/= 2') ||
        scriptText.includes('>> 1') ||
        scriptText.includes('>>= 1');

      functions.unshift({
        type: 'function',
        name: '<script principal>',
        startLine: 1,
        endLine: lines.length,
        bodyText: scriptText,
        loops: mainLoops,
        recursiveCalls: [],
        hasDivisionInBody,
      });
    }

    return functions;
  }

  private buildFunctionNode(
    rawFn: {
      name: string;
      startLine: number;
      parameters: string[];
      bodyLines: { line: number; text: string }[];
    },
    endLine: number
  ): UniversalFunctionNode {
    const bodyText = rawFn.bodyLines.map((l) => l.text).join('\n');
    const hasDivisionInBody =
      bodyText.includes('/ 2') ||
      bodyText.includes('/= 2') ||
      bodyText.includes('>> 1') ||
      bodyText.includes('>>= 1');

    const recursiveCalls: UniversalCallNode[] = [];
    const callRegex = new RegExp(`\\b${rawFn.name}\\s*\\(([^)]*)\\)`, 'g');
    for (const bLine of rawFn.bodyLines) {
      let match;
      while ((match = callRegex.exec(bLine.text)) !== null) {
        recursiveCalls.push({
          type: 'call',
          name: rawFn.name,
          line: bLine.line,
          argsText: match[1],
        });
      }
    }

    const loops = this.extractLoops(rawFn.bodyLines);

    return {
      type: 'function',
      name: rawFn.name,
      startLine: rawFn.startLine,
      endLine,
      bodyText,
      loops,
      recursiveCalls,
      hasDivisionInBody,
    };
  }

  private extractLoops(lines: { line: number; text: string }[]): UniversalLoopNode[] {
    const topLoops: UniversalLoopNode[] = [];
    const stack: UniversalLoopNode[] = [];

    for (const l of lines) {
      const isFor = l.text.startsWith('for ') || l.text.startsWith('for{') || l.text === 'for {';

      if (isFor) {
        let stepType: 'linear' | 'logarithmic' | 'sqrt' = 'linear';
        let explanation = 'Laço Go com passo linear O(n)';

        if (
          /\/=\s*\d+/.test(l.text) ||
          /\*=\s*\d+/.test(l.text) ||
          /\/\s*\d+/.test(l.text) ||
          /\*\s*\d+/.test(l.text) ||
          />>=\s*\d+/.test(l.text) ||
          /<<=\s*\d+/.test(l.text) ||
          />>\s*\d+/.test(l.text)
        ) {
          stepType = 'logarithmic';
          explanation = 'Laço Go com passo multiplicativo/divisivo -> O(log n)';
        }

        const loopNode: UniversalLoopNode = {
          type: 'loop',
          loopKind: 'for',
          line: l.line,
          stepType,
          explanation,
          subLoops: [],
        };

        if (stack.length === 0) {
          topLoops.push(loopNode);
        } else {
          stack[stack.length - 1].subLoops.push(loopNode);
        }

        stack.push(loopNode);
      } else {
        if (stack.length > 0) {
          if (
            /\/=\s*\d+/.test(l.text) ||
            /\*=\s*\d+/.test(l.text) ||
            /\/\s*\d+/.test(l.text) ||
            /\*\s*\d+/.test(l.text) ||
            />>=\s*\d+/.test(l.text) ||
            /<<=\s*\d+/.test(l.text) ||
            />>\s*\d+/.test(l.text)
          ) {
            stack[stack.length - 1].stepType = 'logarithmic';
            stack[stack.length - 1].explanation =
              'Laço Go com alteração multiplicativa/divisiva -> O(log n)';
          }
        }
        if (l.text.includes('}')) {
          if (stack.length > 0) {
            stack.pop();
          }
        }
      }
    }

    return topLoops;
  }
}
