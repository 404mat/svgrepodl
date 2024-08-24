export function checkUrlIsValid(url) {
  return /^(https?:\/\/)?(www\.)?svgrepo\.com\/(collection|vectors)\/.+/.test(url);
}

export function getCollectionNameAsWordsArray(url, typeOfPackage = 'collection') {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;

  // Collection
  // Find the start index of the segment
  const startIndex = pathname.indexOf(typeOfPackage);
  if (startIndex === -1) {
    // segment is not found, return empty array
    return [];
  }

  // Extract the part of the pathname after the segment
  const partAfterSegment = pathname.substring(startIndex + typeOfPackage.length);

  // Split the remaining part into words based on '/'
  const words = partAfterSegment.split('/')[0].split('-');

  return words;
}
