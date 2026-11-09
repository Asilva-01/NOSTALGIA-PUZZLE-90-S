#!/usr/bin/env node
import { resolve } from 'node:path';
import { loadCatalogFile, validateCatalogJson } from './validate.ts';

function argList(name: string, fallback: string[]): string[] {
  const values: string[] = [];
  for (let i = 0; i < process.argv.length; i += 1) {
    if (process.argv[i] === name && process.argv[i + 1]) {
      values.push(process.argv[i + 1] ?? '');
    }
  }
  return values.length > 0 ? values : fallback;
}

function argNum(name: string, fallback: number): number {
  const index = process.argv.indexOf(name);
  if (index >= 0) {
    return Number(process.argv[index + 1]);
  }
  return fallback;
}

const catalogs = argList('--catalog', [
  'assets/nostalgia/catalog.json',
  'assets/bible/catalog.json',
]);
const minEntries = argNum('--min', Number(process.env.CATALOG_MIN ?? 1));
const warnBelow = argNum('--warn-below', Number(process.env.CATALOG_WARN_BELOW ?? 200));

let failed = false;
for (const relative of catalogs) {
  const catalogPath = resolve(process.cwd(), relative);
  const raw = loadCatalogFile(catalogPath);
  const result = validateCatalogJson(raw, { minEntries, warnBelow, catalogPath });
  const label = relative;
  if (result.ok) {
    console.log(`OK ${label} (${result.validIds.length} válido(s))`);
  } else {
    console.error(`FALHA ${label}`);
    failed = true;
  }
  for (const issue of result.issues) {
    const line = `[${issue.level}] ${issue.code}: ${issue.message}`;
    if (issue.level === 'error') {
      console.error(line);
    } else {
      console.warn(line);
    }
  }
}

if (failed) {
  process.exit(1);
}
