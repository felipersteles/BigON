import { UniversalFileAST } from './types';
import { PythonUniversalParser } from './parsers/pythonUniversalParser';
import { RubyUniversalParser } from './parsers/rubyUniversalParser';
import { CppUniversalParser } from './parsers/cppUniversalParser';
import { GoUniversalParser } from './parsers/goUniversalParser';
import { JavaUniversalParser } from './parsers/javaUniversalParser';

export function normalizeLanguageId(languageId: string, fileName: string = ''): string {
  const lang = (languageId || '').toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (lang === 'python' || ext === 'py' || ext === 'pyw') return 'python';
  if (lang === 'ruby' || ext === 'rb') return 'ruby';
  if (
    lang === 'cpp' ||
    lang === 'c' ||
    lang === 'c_cpp' ||
    ['cpp', 'c', 'hpp', 'h', 'cc', 'cxx', 'ino'].includes(ext)
  ) {
    return 'cpp';
  }
  if (lang === 'go' || ext === 'go') return 'go';
  if (lang === 'java' || ext === 'java') return 'java';
  return 'typescript';
}

export class UniversalParserRouter {
  private pythonParser = new PythonUniversalParser();
  private rubyParser = new RubyUniversalParser();
  private cppParser = new CppUniversalParser();
  private goParser = new GoUniversalParser();
  private javaParser = new JavaUniversalParser();

  public parse(code: string, languageId: string, fileName: string = ''): UniversalFileAST {
    const normLang = normalizeLanguageId(languageId, fileName);
    const functions = normLang === 'python'
      ? new PythonUniversalParser().parse(code)
      : normLang === 'ruby'
        ? new RubyUniversalParser().parse(code)
        : normLang === 'cpp'
          ? new CppUniversalParser().parse(code)
          : [];

    return { functions };
  }
}
