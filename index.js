#!/usr/bin/env node

import * as p from '@clack/prompts';
import isValidPath from 'is-valid-path';
import {
  checkCollectionUrlIsValid,
  getCollectionNameAsWordsArray,
  checkUserCancelled,
  sanitizePath,
} from './utilities.js';
import * as logic from './logic.js';
import pc from 'picocolors';

async function main() {
  p.intro(
    pc.bgCyan(
      pc.black(
        `Download SVGs from SVG Repo ${pc.italic('(https://www.svgrepo.com/)')}  in a ${pc.bold('CLI')} !`,
      ),
    ),
  );

  // user input : link to collection
  const url = await p.text({
    message: 'Enter the link to the icons collection:',
    placeholder: 'URL to the collection',
    validate(value) {
      if (!checkCollectionUrlIsValid(value)) {
        return 'This URL is not an SVG Repo URL ! ❌';
      }
    },
  });
  checkUserCancelled(url);

  // user input : output directory
  const outputDirectoryPath = await p.text({
    message: 'Enter the directory to save the icons to:',
    placeholder:
      'Leave empty to save in the current directory. The name of the directory will be the collection name.',
    validate(value) {
      if (!isValidPath(sanitizePath(value))) {
        console.log(pathCheck);
        return 'This path is not valid ! ❌';
      }
    },
  });
  checkUserCancelled(outputDirectoryPath);

  const folderName = getCollectionNameAsWordsArray(url);
  const sanitisedPath = sanitizePath(outputDirectoryPath);

  const confirmContinue = await p.confirm({
    message: `The icons will be downloaded to the folder '${folderName}' in ${sanitisedPath || 'the current directory'}. Is it correct ?`,
  });
  checkUserCancelled(confirmContinue);

  if (!confirmContinue) {
    p.outro('Aborted ! ❌');
    return;
  }

  await logic.downloader(url, sanitisedPath || folderName);

  p.outro(pc.bgCyan(pc.black('Done ! ✅')));
}

main().catch((err) => console.error(err.stack));
