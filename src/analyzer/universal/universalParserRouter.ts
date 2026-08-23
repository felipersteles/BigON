import { UniversalFileAST } from './types';
import { PythonUniversalParser } from './parsers/pythonUniversalParser';
import { RubyUniversalParser } from './parsers/rubyUniversalParser';
import { CppUniversalParser } from './parsers/cppUniversalParser';

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
  return 'typescript';
}

export class UniversalParserRouter {
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
