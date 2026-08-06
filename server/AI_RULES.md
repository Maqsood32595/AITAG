# AITAG AI Agent Architecture Rules & Design Constraints

## Core Architecture: Sandwich AST + Fractal Kernel (Light Theme UI)

All AI agents generating, refactoring, or extending code for AITAG must adhere to these rules:

### 1. Directory & Slice Isolation
- Operate strictly within assigned feature slices inside `server/features/<feature-name>/`.
- Do not mutate global files like `server/index.js` or `server/kernel.js`.
- Maintain self-contained structure: `feature.manifest.json`, `routes.js`, `service.js`, `ui/`.

### 2. Sandwich AST Context Bounding
- Keep step context bounded to **~15 tokens per AST feature slice**.
- Never accumulate full codebase prompts across steps.
- Use stateless slice payloads for sub-second, parallel generation.

### 3. Role-Based Access & Security
- Support multi-role access control: Admin, Client, Freelancer.
- Enforce Section 194-O (1% TDS) tax calculation on gross milestone payouts.
- Redact PII (phone numbers, email, UPI handles, WhatsApp links) in real-time chat.
