import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
) as {
  activationEvents: string[];
  contributes: { commands: { command: string }[] };
};

describe('extension manifest', () => {
  test('declares activation events for every contributed command', () => {
    const events = new Set(manifest.activationEvents);

    for (const command of manifest.contributes.commands) {
      expect(events).toContain(`onCommand:${command.command}`);
    }
  });
});
