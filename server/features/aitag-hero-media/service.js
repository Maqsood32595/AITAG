/**
 * AITAG Hero Floating Media Service
 * Resolves static asset availability safely so disabled or missing media
 * never breaks the homepage hero experience.
 */
const fs = require('fs');
const path = require('path');

const VIDEO_FILENAME = 'hero-floating-video.mp4';
const POSTER_CANDIDATES = ['hero-floating-poster.webp', 'hero-floating-poster.jpg'];

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
  const resolvedPoster = POSTER_CANDIDATES.find((name) => assetExists(name)) || null;

  return {
    success: true,
    service: 'aitag-hero-media',
    enabled: true,
    available: videoAvailable,
    videoUrl: `/${VIDEO_FILENAME}`,
    posterUrl: resolvedPoster ? `/${resolvedPoster}` : null,
    aspectRatio: 1024 / 576,
    label: 'AITAG Intro',
    mutedByDefault: false,
  };
}

module.exports = {
  getHeroMediaConfig,
};
