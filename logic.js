import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import * as mkdirp from 'mkdirp';
import ProgressBar from 'progress';
import * as p from '@clack/prompts';
import { checkUserCancelled } from './utilities.js';

class DownloadException extends Error {}

/**
 * Lists all the collections from the given category.
 * @param {string} [category=all] - The category to list.
 */
async function listCollections(category = 'all') {
  const url = `https://www.svgrepo.com/collections/${category}/`;
  const { data } = await axios.get(url);
  const soup = cheerio.load(data);
  const numPage = await getPage(soup);

  for (let page = 1; page <= numPage; page++) {
    console.error(`page ${page}/${numPage}`);
    const pageUrl = page > 1 ? `${url}${page}` : url;
    const { data: pageData } = await axios.get(pageUrl);
    const pageSoup = cheerio.load(pageData);
    const allLinks = pageSoup('div[class^="style_Collection__"] a')
      .map((_, a) => pageSoup(a).attr('href'))
      .get();

    console.log(allLinks.join('\n'));
  }
}

/**
 * Gets the total number of pages from the footer of the given page.
 * @param {cheerio} soup - The parsed HTML of the page.
 * @returns {number} The total number of pages.
 */
async function getPage(soup) {
  const pageFooter = soup('div[class^="style_pagingCarrier"]').first().text();
  return parseInt(pageFooter.replace(/.*\/\s+/, ''));
}

/**
 * Downloads all the icons from the given links and saves them to the given
 * directory.
 * @param {string[]} allLinks - The links to download.
 * @param {string} downloadPath - The directory to save the files to.
 * @param {ProgressBar} bar - The progress bar to update.
 */
async function downloadItems(allLinks, downloadPath, bar) {
  for (const link of allLinks) {
    const aid = path.basename(path.dirname(link));
    const dest = path.join(downloadPath, `${aid}-${path.basename(link)}`);
    if (fs.existsSync(dest)) {
      // File already exists, skipping
      continue;
    }

    try {
      const { headers, data } = await axios.get(link, { responseType: 'arraybuffer' });

      // checking if file is an svg
      if (headers['content-type'] !== 'image/svg+xml') {
        console.error(`Response not svg file : ${link}`);
        continue;
      }

      // writing file to disk
      fs.writeFileSync(dest, data);
      // advancing progress bar
      bar.tick();
    } catch (err) {
      console.error(`Download failed: ${link}`);
    }
  }
}

/**
 * Downloads all the icons from the given URL and saves them to the given
 * directory.
 * @param {string} url - The URL to download from. Can be a collection or search
 *   results page.
 * @param {string} outputDirectoryPath - The directory to save the files to.
 * @param {boolean} [onlyList=false] - Whether to just list the icons or download
 *   them.
 * @param {string} [collection=''] - The collection name to prefix the list with.
 */
export async function downloader(url, outputDirectoryPath, onlyList = false, collection = '') {
  const isSearch = url.includes('/vectors/');

  // fetching raw HTML data
  const { data: rawData } = await axios.get(url);
  // parse HTML
  const soup = cheerio.load(rawData);
  // get total number of pages
  const numPage = isSearch ? 99 : await getPage(soup);

  // check if directory exists then create
  if (fs.existsSync(outputDirectoryPath)) {
    const continueOperation = await p.confirm({
      message: `Directory ${outputDirectoryPath} already exists, and will be erased. Do you want to continue ?`,
    });
    checkUserCancelled(continueOperation);
    if (!continueOperation) {
      p.outro('Aborted ! ❌');
      process.exit(0);
    }

    // remove existing directory
    fs.rmSync(outputDirectoryPath, { recursive: true, force: true });
  }

  // create output directory
  mkdirp.sync(outputDirectoryPath);

  for (let page = 1; page <= numPage; page++) {
    const pageUrl = page > 1 ? `${url}${page}` : url;

    const { data: pageData } = await axios.get(pageUrl);
    // parse HTML
    const pageSoup = cheerio.load(pageData);
    // getting source link for every icon
    const allLinks = pageSoup('div[class^="style_NodeImage_"] img[itemprop="contentUrl"]')
      .map((_, img) => pageSoup(img).attr('src'))
      .get();
    if (allLinks.length === 0) {
      break;
    }

    // user only wants to have a list of icons
    if (onlyList) {
      console.log(allLinks.map((link) => `${collection}\t${link}`).join('\n'));
      continue;
    }

    // creating progress bar for user display
    const bar = new ProgressBar(`📥 Collection on page ${page}/${numPage} [:bar] :percent :etas`, {
      total: allLinks.length,
      width: 40,
    });

    await downloadItems(allLinks, outputDirectoryPath, bar);
  }
}

// Example usage for local developemnt :
//downloader('https://www.svgrepo.com/collection/iconship-interface-icons/', './download', false);
