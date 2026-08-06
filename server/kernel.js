/**
 * AITAG Fractal Kernel — Discovery, Dynamic Route Mounting & Feature Lifecycle Engine
 * =====================================================================================
 * Scans `server/features/`, reads manifests, mounts routes dynamically,
 * and maps frontend static assets.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

class FractalKernel {
  constructor() {
    this.features = new Map();
    this.mountedRoutes = new Map();
    this.featuresDir = path.join(__dirname, 'features');
  }

  init(app) {
    console.log('🌀 Bootstrapping AITAG Fractal Kernel Architecture...');
    if (!fs.existsSync(this.featuresDir)) {
      fs.mkdirSync(this.featuresDir, { recursive: true });
    }

    const featureFolders = fs.readdirSync(this.featuresDir);

    featureFolders.forEach((folder) => {
      const folderPath = path.join(this.featuresDir, folder);
      if (!fs.statSync(folderPath).isDirectory()) return;

      const manifestPath = path.join(folderPath, 'feature.manifest.json');
      if (!fs.existsSync(manifestPath)) return;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.folderName = folder;
        manifest.folderPath = folderPath;

        this.features.set(manifest.id, manifest);

        if (manifest.enabled) {
          this.mountFeature(app, manifest);
        }
      } catch (err) {
        console.error(`❌ Failed to parse manifest in ${folder}:`, err.message);
      }
    });

    app.get('/api/features', (req, res) => {
      const registry = Array.from(this.features.values()).map((f) => ({
        id: f.id,
        name: f.name,
        version: f.version,
        basePath: f.basePath,
        enabled: f.enabled,
        uiPath: `/features/${f.id}`
      }));
      res.json(registry);
    });

    console.log(`✅ AITAG Kernel active. ${this.mountedRoutes.size} feature slices mounted.`);
  }

  mountFeature(app, manifest) {
    const routesPath = path.join(manifest.folderPath, 'routes.js');
    const uiPath = path.join(manifest.folderPath, 'ui');

    if (fs.existsSync(routesPath)) {
      try {
        delete require.cache[require.resolve(routesPath)];
        const router = require(routesPath);
        app.use(manifest.basePath, router);
        this.mountedRoutes.set(manifest.id, manifest.basePath);
        console.log(`  🔌 Mounted API: ${manifest.name} → ${manifest.basePath}`);
      } catch (e) {
        console.error(`❌ Error mounting routes for ${manifest.id}:`, e.message);
      }
    }

    if (fs.existsSync(uiPath)) {
      const staticUrl = `/features/${manifest.id}`;
      app.use(staticUrl, express.static(uiPath));
      console.log(`  🎨 Mapped UI:  ${manifest.name} → ${staticUrl}`);
    }
  }
}

module.exports = new FractalKernel();
