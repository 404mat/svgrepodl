import * as p from '@clack/prompts';

export function checkCollectionUrlIsValid(url) {
  return /^(https?:\/\/)?(www\.)?svgrepo\.com\/(collection|vectors)\/.+/.test(url);
}

export function pathHasSpaces(path) {
  return /\s/.test(path);
}

export function sanitizePath(path) {
  if (!path) {
    return path;
  }

  const sanitisedPath = path
    // remove double backslashes
    .replace(/\\\\/g, '\\')
    // remove double quotes around the path
    .replace(/^"(.*)"$/, '$1')
    // remove whitespace around the path
    .replace(/^\s+|\s+$/g, '');
  return sanitisedPath;
}

export function checkUserCancelled(value) {
  if (p.isCancel(value)) {
    console.log('Aborted ! ❌');
    process.exit(0);
  }
}

export function getCollectionNameAsWordsArray(url, typeOfPackage = 'collection') {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;

  // Collection
  // Find the start index of the segment
  const startIndex = pathname.indexOf(typeOfPackage);
  if (startIndex === -1) {
    // segment is not found, return empty array
    return '';
  }

  // Extract the part of the pathname after the segment
  const partAfterSegment = pathname.substring(startIndex + typeOfPackage.length);
  const collectionSlug = partAfterSegment.replace(/\\/g, '').replace(/\//g, '');
  const collectionAsPhrase = collectionSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return collectionAsPhrase || collectionSlug;
}
