# Adicionar suporte a uma linguagem

O suporte a uma linguagem é implementado pelo parser universal e pelo roteamento da extensão.

## 1. Criar o parser

Adicione um parser em `src/analyzer/universal/parsers/`. O parser deve produzir os tipos definidos em `src/analyzer/universal/types.ts`.

## 2. Registrar o parser

Atualize `src/analyzer/universal/universalParserRouter.ts` para normalizar o identificador da linguagem e encaminhar o código ao novo parser.

## 3. Ativar a extensão

Adicione o evento `onLanguage:<id>` em `package.json` e inclua o identificador normalizado na função `isSupportedDocument` de `src/extension.ts`.

## 4. Criar testes

Adicione casos em `test/multiLanguage.test.ts` para laços, recursão e outros padrões que o parser deve reconhecer. Execute `npm test` antes de abrir a alteração.

_Verified against `main`@`077ea84` on 2026-08-22._

## Adicionar tradução da interface

As traduções ficam em `src/i18n/`. O catálogo `en.ts` é o fallback padrão;
adicione um novo catálogo implementando `Messages` e registre-o em
`src/i18n/index.ts`. A seleção usa `vscode.env.language`, portanto respeita o
idioma configurado no VS Code (normalmente herdado do sistema operacional).
