import * as p from '@clack/prompts';
import { checkUrlIsValid } from './utilities.js';
import * as logic from './logic.js';

async function main() {
  p.intro(
    'Welcome to SVG Repo Downloader CLI - a command-line tool to download SVG icons from https://www.svgrepo.com/',
  );

  const { url } = await p.text({
    message: 'Enter the link to the icons collection:',
    mask: 'URL to the collection',
    //validate: (url) => checkUrlIsValid(url) ? url : 'The link is not a valid SVG Repo ! ❌',
  });

  const { outputDirectoryPath } = await p.text({
    message: 'Enter the directory to save the icons to:',
  });

  await logic.downloader(url, outputDirectoryPath);
}

main().catch((err) => console.error(err.stack));
