/**
 * AITAG Fractal Kernel — Discovery, Dynamic Route Mounting & Feature Lifecycle Engine
 * =====================================================================================
 * Multi-Scale Architecture:
 * Level 0: Kernel (Discovery & Global Security Engine)
 * Level 1: Domains / Parent Slices (Bounded Contexts)
 * Level 2: Children (Feature Routers & Controllers)
 * Level 3: Grandchildren (Pure Atomic Engines, Validators & Guards)
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

class FractalKernel {
  constructor() {
    this.features = new Map();
    this.domains = new Map();
    this.mountedRoutes = new Map();
    this.featuresDir = path.join(__dirname, 'features');
    this.cache = this._resolveCache();
  }

  _resolveCache() {
    const candidatePaths = [
      './features/aitag-cache/service',
      './features/domain-platform/children/cache/service'
    ];
    for (const cp of candidatePaths) {
      try {
        return require(cp);
      } catch {}
    }
    return null;
  }

  _resolveSecurityGuard() {
    const candidatePaths = [
      './features/aitag-security-guard/routes',
      './features/domain-security/children/middleware/routes',
      './features/domain-security/routes'
    ];
    for (const cp of candidatePaths) {
      try {
        return require(cp);
      } catch {}
    }
    return null;
  }

  init(app) {
    console.log('🌀 Bootstrapping AITAG Fractal Kernel Architecture...');

    // 🛡️ Global Security Hardening: OWASP Headers, Rate Limiting, XSS Defense & Log Scrubbing
    try {
      const securityGuard = this._resolveSecurityGuard();
      if (securityGuard) {
        if (securityGuard.securityHeaders) app.use(securityGuard.securityHeaders);
        if (securityGuard.xssSanitizer) app.use(securityGuard.xssSanitizer);
        if (securityGuard.logScrubberMiddleware) app.use(securityGuard.logScrubberMiddleware);
        if (securityGuard.authLimiter) app.use('/api/auth', securityGuard.authLimiter);
        if (securityGuard.apiLimiter) app.use('/api', securityGuard.apiLimiter);
        console.log('🛡️ Fractal Kernel Security Guard active (OWASP Headers, Rate Limiting, XSS & Log Scrubber).');
      }
    } catch (e) {
      console.warn('⚠️ Security Guard initialization fallback:', e.message);
    }

    if (!fs.existsSync(this.featuresDir)) {
      fs.mkdirSync(this.featuresDir, { recursive: true });
    }

    const entries = fs.readdirSync(this.featuresDir);

    entries.forEach((folder) => {
      const folderPath = path.join(this.featuresDir, folder);
      if (!fs.statSync(folderPath).isDirectory()) return;

      const domainManifestPath = path.join(folderPath, 'domain.manifest.json');
      const featureManifestPath = path.join(folderPath, 'feature.manifest.json');

      // Check if this folder is a Parent Domain
      if (fs.existsSync(domainManifestPath)) {
        try {
          const domainManifest = JSON.parse(fs.readFileSync(domainManifestPath, 'utf8'));
          domainManifest.folderName = folder;
          domainManifest.folderPath = folderPath;
          domainManifest.isDomain = true;
          this.domains.set(domainManifest.id, domainManifest);

          if (domainManifest.enabled !== false) {
            this.mountDomain(app, domainManifest);
          }
          return;
        } catch (err) {
          console.error(`❌ Failed to parse domain manifest in ${folder}:`, err.message);
          return;
        }
      }

      // Check if this folder is a standard Feature Slice
      if (fs.existsSync(featureManifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(featureManifestPath, 'utf8'));
          manifest.folderName = folder;
          manifest.folderPath = folderPath;

          // Check if feature manifest declares itself as a domain
          if (manifest.type === 'domain' || (Array.isArray(manifest.children) && manifest.children.length > 0)) {
            manifest.isDomain = true;
            this.domains.set(manifest.id, manifest);
            if (manifest.enabled !== false) {
              this.mountDomain(app, manifest);
            }
          } else {
            this.features.set(manifest.id, manifest);
            if (manifest.enabled !== false) {
              this.mountFeature(app, manifest);
            }
          }
        } catch (err) {
          console.error(`❌ Failed to parse manifest in ${folder}:`, err.message);
        }
      }
    });

    // Discovery & Observability API
    app.get('/api/features', (req, res) => {
      const registry = Array.from(this.features.values()).map((f) => ({
        id: f.id,
        name: f.name,
        version: f.version || '1.0.0',
        basePath: f.basePath,
        enabled: f.enabled !== false,
        domain: f.domain || null,
        type: f.type || 'feature',
        uiPath: f.uiPath || `/features/${f.id}`
      }));

      res.json(registry);
    });

    app.get('/api/domains', (req, res) => {
      const domainList = Array.from(this.domains.values()).map((d) => ({
        id: d.id,
        name: d.name,
        version: d.version || '1.0.0',
        enabled: d.enabled !== false,
        description: d.description || '',
        childrenCount: d.children ? d.children.length : 0,
        folderName: d.folderName
      }));
      res.json(domainList);
    });

    console.log(`✅ AITAG Kernel active. ${this.mountedRoutes.size} endpoints mounted (${this.domains.size} domains, ${this.features.size} active feature slices).`);
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

  mountDomain(app, domainManifest) {
    console.log(`📦 Mounting Domain: [${domainManifest.name}] (${domainManifest.id})`);
    const domainFolder = domainManifest.folderPath;

    // 1. Check if domain exports a top-level router or gateway
    const domainRoutesPath = path.join(domainFolder, 'routes.js');
    if (fs.existsSync(domainRoutesPath) && domainManifest.basePath) {
      try {
        delete require.cache[require.resolve(domainRoutesPath)];
        const domainRouter = require(domainRoutesPath);
        app.use(domainManifest.basePath, domainRouter);
        this.mountedRoutes.set(domainManifest.id, domainManifest.basePath);
        console.log(`  🌐 Mounted Domain Gateway: ${domainManifest.name} → ${domainManifest.basePath}`);
      } catch (e) {
        console.error(`❌ Error mounting domain gateway for ${domainManifest.id}:`, e.message);
      }
    }

    // 2. Discover & Mount Children
    const childrenDir = path.join(domainFolder, 'children');
    const declaredChildren = Array.isArray(domainManifest.children) ? domainManifest.children : [];

    const declaredMap = new Map();
    declaredChildren.forEach((c) => {
      if (c.folder) declaredMap.set(c.folder, c);
      if (c.id) declaredMap.set(c.id, c);
    });

    if (fs.existsSync(childrenDir)) {
      const childEntries = fs.readdirSync(childrenDir);
      childEntries.forEach((childFolder) => {
        const childFolderPath = path.join(childrenDir, childFolder);
        if (!fs.statSync(childFolderPath).isDirectory()) return;

        const childManifestPath = path.join(childFolderPath, 'child.manifest.json');
        let childConfig = declaredMap.get(childFolder) || declaredMap.get(`children/${childFolder}`) || {};

        if (fs.existsSync(childManifestPath)) {
          try {
            const parsed = JSON.parse(fs.readFileSync(childManifestPath, 'utf8'));
            childConfig = { ...parsed, ...childConfig };
          } catch {}
        }

        const childId = childConfig.id || `${domainManifest.id}:${childFolder}`;
        const childName = childConfig.name || `${domainManifest.name} - ${childFolder}`;
        const childBasePath = childConfig.basePath || `/api/${childFolder}`;
        const childRoutesPath = childConfig.routes
          ? path.join(domainFolder, childConfig.routes)
          : path.join(childFolderPath, 'routes.js');

        if (childConfig.enabled !== false && fs.existsSync(childRoutesPath)) {
          try {
            delete require.cache[require.resolve(childRoutesPath)];
            const childRouter = require(childRoutesPath);
            app.use(childBasePath, childRouter);
            this.mountedRoutes.set(childId, childBasePath);

            const featureEntry = {
              id: childId,
              name: childName,
              version: childConfig.version || domainManifest.version || '1.0.0',
              basePath: childBasePath,
              enabled: true,
              domain: domainManifest.id,
              type: 'child',
              folderPath: childFolderPath,
              uiPath: `/features/${domainManifest.id}/${childFolder}`
            };
            this.features.set(childId, featureEntry);
            console.log(`  🔌 Mounted Child API: [${domainManifest.id}] ${childName} → ${childBasePath}`);
          } catch (e) {
            console.error(`❌ Error mounting child route ${childId}:`, e.message);
          }
        }

        const childUiPath = path.join(childFolderPath, 'ui');
        if (fs.existsSync(childUiPath)) {
          const staticUrl = `/features/${domainManifest.id}/${childFolder}`;
          app.use(staticUrl, express.static(childUiPath));
          console.log(`  🎨 Mapped Child UI: ${childName} → ${staticUrl}`);
        }
      });
    }

    // 3. Mount any explicitly declared children outside childrenDir
    declaredChildren.forEach((c) => {
      if (!c.basePath || !c.routes) return;
      const childRoutesPath = path.join(domainFolder, c.routes);
      if (fs.existsSync(childRoutesPath) && !this.mountedRoutes.has(c.id)) {
        try {
          delete require.cache[require.resolve(childRoutesPath)];
          const router = require(childRoutesPath);
          app.use(c.basePath, router);
          this.mountedRoutes.set(c.id, c.basePath);
          this.features.set(c.id, {
            id: c.id,
            name: c.name || c.id,
            version: c.version || domainManifest.version || '1.0.0',
            basePath: c.basePath,
            enabled: c.enabled !== false,
            domain: domainManifest.id,
            type: 'child',
            folderPath: path.dirname(childRoutesPath)
          });
          console.log(`  🔌 Mounted Declared Child: [${domainManifest.id}] ${c.name} → ${c.basePath}`);
        } catch (e) {
          console.error(`❌ Error mounting declared child ${c.id}:`, e.message);
        }
      }
    });

    // 4. Verify Grandchildren if present
    const grandchildrenDir = path.join(domainFolder, 'grandchildren');
    if (fs.existsSync(grandchildrenDir)) {
      const gcFiles = fs.readdirSync(grandchildrenDir).filter(f => f.endsWith('.js'));
      console.log(`  💎 Registered ${gcFiles.length} Grandchild pure engines in ${domainManifest.id}`);
    }
  }
}

module.exports = new FractalKernel();
