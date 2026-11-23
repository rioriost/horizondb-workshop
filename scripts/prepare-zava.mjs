import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'zava');
const patch = resolve(root, 'patches/zava-azd.patch');
const revision = '74d448cde1066defc62bb17ae999f68ab1cfa9f2';
const upstream = 'https://github.com/microsoft/Build26-DEM364-simplify-app-dev-with-cloud-native-postgresql-in-azure-horizondb.git';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return false;
  }
}

function git(...args) {
  execFileSync('git', args, { stdio: 'inherit' });
}

if (await exists(destination)) {
  for (const name of ['.git', 'azure.yaml', 'infra/main.bicep', 'scripts/hooks.mjs',
    'src/zava-designer-agent-ui-demo/server.mjs', 'data/products.csv']) {
    if (!await exists(resolve(destination, name))) {
      throw new Error(`Existing ${destination} is not the prepared fork. Missing ${name}; no files were overwritten.`);
    }
  }
  console.log(`Reusing the existing editable fork at ${destination}; no files were overwritten.`);
} else {
  await access(patch);
  git('clone', '--no-checkout', upstream, destination);
  git('-C', destination, 'checkout', '-B', 'workshop/azd', revision);
  git('-C', destination, 'remote', 'rename', 'origin', 'upstream');
  git('-C', destination, 'remote', 'set-url', '--push', 'upstream', 'DISABLED');
  git('-C', destination, 'apply', '--check', patch);
  git('-C', destination, 'apply', patch);
  console.log(`Prepared the editable local fork at ${destination}.`);
}
