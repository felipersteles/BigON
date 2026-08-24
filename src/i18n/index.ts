import { en } from './en';
import { ptBR } from './pt-BR';
import { Messages } from './messages';

export function getMessages(locale: string = 'en'): Messages {
  return locale.toLowerCase().startsWith('pt') ? ptBR : en;
}
