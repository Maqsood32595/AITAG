/**
 * AITAG Hero Floating Media Service
 * Resolves static asset availability safely so disabled or missing media
 * never breaks the homepage hero experience.
 */
const fs = require('fs');
const path = require('path');

const VIDEO_FILENAME = 'hero-floating-video.mp4';
const POSTER_FILENAME = 'hero-floating-poster.jpg';

const SEARCH_DIRS = [
  path.join(__dirname, '../../../client/dist'),
  path.join(__dirname, '../../../client/public'),
  path.join(__dirname, '../../public'),
];

function assetExists(filename) {
  return SEARCH_DIRS.some((dir) => {
    try {
      return fs.existsSync(path.join(dir, filename));
    } catch {
      return false;
    }
  });
}

function getHeroMediaConfig() {
  const videoAvailable = assetExists(VIDEO_FILENAME);
  const posterAvailable = assetExists(POSTER_FILENAME);

  return {
    success: true,
    service: 'aitag-hero-media',
    enabled: true,
    available: videoAvailable,
    videoUrl: `/${VIDEO_FILENAME}`,
    posterUrl: posterAvailable ? `/${POSTER_FILENAME}` : null,
    aspectRatio: 1024 / 576,
    label: 'AITAG Intro',
    mutedByDefault: true,
  };
}

module.exports = {
  getHeroMediaConfig,
};
