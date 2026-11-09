# MINI-ADHY PERSONAL AI — DUPLICATION MANIFEST
## Independent Personal AI Evolution Baseline

**Date:** 2026-11-09  
**Source Repository:** `https://github.com/adhy2312/portfolio`  
**Source Commit Hash:** `7e174be12f8fd688fd23315087a327c5ed054f41`  
**New Project Location:** `d:\portfolio\mini-adhy-personal`  
**Owner:** Adhithya Mohan S (`Adhy`)

---

## 1. DUPLICATION STRATEGY & INDEPENDENCE GUARANTEES

This project is an **autonomous, independent duplicate** created from the hardened Mini-Adhy production baseline.

### Independence Guarantees:
1. **Isolated Git History:** The duplicate has its own Git repository (`git init`) and branches. Commits in this repository do not touch the portfolio codebase.
2. **Network & Port Separation:** Configured to run on `PORT=3001` (portfolio runs on `PORT=3000`), allowing both applications to run simultaneously without port contention.
3. **Storage Namespacing:** LocalStorage and IndexedDB keys use `mini_adhy_personal_` prefix to eliminate session or state collisions.
4. **Cookie & Session Separation:** Perimeter cookie name configured as `mini_adhy_personal_session` to prevent credential cross-talk.
5. **Independent Dependencies:** Dependencies reinstalled directly via `npm install` respecting `package-lock.json` with zero cross-linking.
6. **Zero Leaked Secrets:** Private credentials, OAuth tokens, and production API keys were excluded. Fresh `.env.example` and local `.env` templates provided.

---

## 2. INCLUDED MODULES & AI SUBSYSTEMS

| Subsystem | Source Path | Description |
| :--- | :--- | :--- |
| **Cognitive Core** | `src/core/ai/` | Canonical `AdhyModel` cognitive identity and foundational reasoning |
| **Cognitive Memory** | `src/core/memory/` | `MemoryService`, `MemoryStore`, `IndexedDbStorageEngine`, anti-resurrection tombstones |
| **Cognition & Learning** | `src/core/cognition/`, `src/core/learning/` | `CognitiveContextCompiler`, `CognitiveLearningEngine` feedback loops |
| **Metacognition** | `src/core/metacognition/` | `MetacognitionEngine`, `ProductionSafetyGuard`, `FailureAnalyzer`, `ImprovementProposalEngine` |
| **Executive System** | `src/core/executive/` | `AutonomousExecutiveSystem`, `ExecutionEngine`, `ExecutiveTypes` |
| **Agent Ecosystem** | `src/core/agents/` | `PermissionRegistry` (L0-L3), `UltronOverlord`, `AgentOrchestrator`, `AgentRegistry`, 10 specialists |
| **External Adapters** | `src/core/adapters/` | `HermesAgentAdapter` capability integration |
| **Distribution & Sync** | `src/core/distribution/` | `CognitiveSyncEngine`, `HybridExecutionManager`, `AgentMessageBus`, `PortableIdentityManager` |
| **Multi-Provider Hub** | `src/core/providers/` | `ProviderRegistry`, Gemini, Groq, OmniRoute, Local, HuggingFace, OpenRouter |
| **Live Voice & Vision** | `src/core/live/`, `src/core/vision/` | `LiveVoiceAndVisualSession`, `SpeechToSpeechService`, `VisualStreamPipeline` |
| **Neuro-Context** | `src/core/devices/` | `NeuroContextAdapter`, EEG/ECG/PPG/HRV/EDA DSP pipelines |
| **Personal Extensions** | `src/core/personal/` | `PersonalExecutiveAgent`, `IntegrationRegistry`, Connectors (Gmail, GitHub, Calendar, Drive, Browser, Desktop), `LocalExecutionAgent`, Hardware Gateways (Physical, MQTT, Serial, ESP32, Raspberry Pi), `ProactiveScheduler`, `PersonalDashboardService`, `PersonalSecurityAudit` |
| **Perimeter & API** | `api/` | Origin-hardened auth proxy, token verification, serverless LLM relays |
| **Full Frontend UI** | `src/components/`, `public/` | React dashboard, chat console, live voice orb, visualizer, terminal |
| **Content Studio** | `studio/` | Sanity Studio CMS schemas, desk tools, and build configuration |
| **Documentation & Data** | `AI_AGENT_MEMORY/`, `ai history/`, `docs/`, `*.md` | Masterclass docs, memory files, architecture diagrams |

---

## 3. EXCLUDED GENERATED ARTEFACTS
- `node_modules/` (Reinstalled independently)
- `studio/node_modules/` (Reinstalled independently)
- `build/` (Rebuilt independently from clean source)
- `dist/` (Rebuilt independently)
- `.git/` (Fresh repository initialized)
- `.next/`, `.vercel/`, `.sanity/`
- Real API keys and credentials from `.env`

---

## 4. VERIFICATION EVIDENCE

### A. Test Parity
```bash
npx cross-env CI=true npm test
```
- **Test Suites:** 18 passed, 18 total
- **Tests:** 352 passed, 352 total (333 baseline + 19 personal extension architecture tests)
- **Status:** **100% PASSING**

### B. Production Build
```bash
npm run build
```
- React application compiled successfully
- Sanity Studio compiled successfully
- **Exit Code:** 0

### C. Source Repository Preservation
- Source Repository: `d:\portfolio\portfolio`
- Git Status: `On branch main, working tree clean`
- Pristine commit: `7e174be12f8fd688fd23315087a327c5ed054f41` (100% untouched)
