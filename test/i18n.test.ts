import { getMessages } from '../src/i18n';

describe('i18n', () => {
  test('usa inglês como padrão e fallback', () => {
    expect(getMessages('en-US').time).toBe('Time');
    expect(getMessages('es-ES').time).toBe('Time');
  });

  test('seleciona português para locales pt', () => {
    expect(getMessages('pt-BR').time).toBe('Tempo');
    expect(getMessages('pt-PT').space).toBe('Espaço');
  });
});
