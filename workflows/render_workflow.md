# Render Production Deployment Workflow (`aitag`)

> **Environment:** Production  
> **Service Name:** `aitag`  
> **Render Service ID:** `srv-d9pt5ru7bikc7381vd9g`  
> **Dashboard URL:** [Render Dashboard — aitag](https://dashboard.render.com/web/srv-d9pt5ru7bikc7381vd9g/deploys)  
> **Live Web App:** [https://aitag.onrender.com](https://aitag.onrender.com)  
> **Git Branch:** `main` (`Maqsood32595/AITAG`)  
> **Supabase Project:** `byekbjxiowkrtwpsxevz` (Production)  
> **Development Workflow:** For dev/staging environment instructions, see [render_dev_workflow.md](file:///d:/Hayat/AITAG/workflows/render_dev_workflow.md).

---

## 1. Architecture
AITAG production is hosted on Render via an isolated service connected to the `main` branch.

## 2. Deployment Process
1. **Branch Management**
   - Active development, feature slicing, and staging verification occur on the `develop` branch (see [render_dev_workflow.md](file:///d:/Hayat/AITAG/workflows/render_dev_workflow.md)).
   - Once tested and approved on `aitag-dev`, merge `develop` into `main`.

2. **Triggering a Deploy**
   - **Note:** Render Auto-Deploy is disabled on the production service to prevent unintended releases.
   - Pushing to `main` does NOT automatically trigger a build.
   - To deploy, navigate to the [Render Production Dashboard](https://dashboard.render.com/web/srv-d9pt5ru7bikc7381vd9g/deploys), click **Manual Deploy**, and choose **"Deploy latest commit"**.

3. **GCS Environment Variables**
   - The production Render environment has been configured with `GCS_CREDENTIALS` (base64 encoded JSON) to support the direct-to-bucket video uploading feature used in `Profile.tsx` / `Workflows.tsx`.

4. **Monitoring**
   - Check the Render logs if any 500 errors occur in production.
