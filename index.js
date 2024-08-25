import * as p from '@clack/prompts';
import isValidPath from 'is-valid-path';
import { checkUrlIsValid, getCollectionNameAsWordsArray } from './utilities.js';
import * as logic from './logic.js';

async function main() {
  p.intro(
    'Welcome to SVG Repo Downloader CLI - a command-line tool to download SVG icons from https://www.svgrepo.com/',
  );

  // user input : link to collection
  const url = await p.text({
    message: 'Enter the link to the icons collection:',
    placeholder: 'URL to the collection',
    validate(value) {
      if (!checkUrlIsValid(value)) {
        return 'This URL is not an SVG Repo URL ! ❌';
      }
    },
  });

  // user input : output directory
  const outputDirectoryPath = await p.text({
    message: 'Enter the directory to save the icons to:',
    placeholder:
      'Leave empty to save in the current directory. The name of the directory will be the collection name.',
    validete(value) {
      if (!isValidPath(value)) {
        return 'This path is not valid ! ❌';
      }
    },
  });

  const folderName = getCollectionNameAsWordsArray(url);
  console.log(`Folder name: ${folderName}`);

  await logic.downloader(url, outputDirectoryPath ? outputDirectoryPath : './tmp');
}

main().catch((err) => console.error(err.stack));
