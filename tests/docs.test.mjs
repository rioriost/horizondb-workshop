import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith('.md') ? [path] : [];
  }));
  return groups.flat();
}

test('all local Markdown links and referenced heading anchors resolve', async () => {
  const files = [resolve(root, 'README.md'), resolve(root, 'README.en.md'), ...await markdownFiles(resolve(root, 'docs'))];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^[a-z]+:/i.test(link)) continue;
      const [path, anchor] = link.split('#');
      const target = path ? resolve(dirname(file), path) : file;
      await access(target);
      if (anchor) {
        const targetText = await readFile(target, 'utf8');
        const headings = [...targetText.matchAll(/^#+ (.+)$/gm)].map(heading =>
          heading[1].toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replaceAll(' ', '-'));
        assert.ok(headings.includes(decodeURIComponent(anchor)), `Missing anchor ${link} in ${file}`);
      }
    }
  }
});
