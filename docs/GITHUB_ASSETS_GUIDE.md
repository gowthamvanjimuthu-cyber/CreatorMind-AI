# GitHub Assets & Branding Guide 🎨

This document serves as the master blueprint for finalizing **CreatorMind AI**’s visual branding for public release. Since high-quality visuals are the primary driver of GitHub engagement and stars, strict adherence to this organizational structure is required.

---

## 1. Folder Organization (`docs/assets/`)

| Folder | Purpose | Expected Files | Naming Convention |
|--------|---------|----------------|-------------------|
| `logos/` | Brand identity and favicons used across the app and README. | Vector SVGs, transparent PNGs, Icon bundles. | `logo_light.svg`, `logo_dark.png`, `favicon.ico` |
| `screenshots/` | Static high-fidelity captures of individual features/pages. | 16:9 1080p PNG files highlighting UI borders cleanly. | `view_[feature]_[theme].png` e.g., `view_dashboard_dark.png` |
| `gifs/` | Short, accelerated micro-interactions demonstrating core RAG workflows. | Highly compressed, <5MB `.gif` loops. | `demo_[action]_[speed].gif` e.g., `demo_upload_fast.gif` |
| `architecture/` | Mermaid renders or beautiful abstract system topologies. | Static images mapping to System Flow / ER schemas. | `arch_[system_component].png` e.g., `arch_rag_pipeline.png` |
| `demo/` | Large-scale promotional content (video links, full landing page stitched images). | `.md` links to external MP4 hostings, or cover banners. | `promo_[asset_type].jpg` e.g., `promo_github_banner.jpg` |

---

## 2. Screenshot Checklist 📸

All screenshots must be taken in a 16:9 aspect ratio at a minimum of 1920x1080 resolution, ideally using a clean browser frame (like Safari on macOS or a specialized mockup tool) with no cluttered extension bars visible.

- [ ] **Login / Register**: Clean shot of the Auth hooks (Supabase simulated).
- [ ] **Dashboard**: Emphasize the telemetry ring chart and knowledge metrics.
- [ ] **Workspace View**: Blank state showing isolated project buckets.
- [ ] **Knowledge Library**: Document lists highlighting the "Indexed" badge.
- [ ] **Upload Document**: The drag-and-drop ingestion modal.
- [ ] **Chat**: A multi-turn RAG query against ChromaDB chunks.
- [ ] **Streaming Response**: Action shot showing text generating.
- [ ] **Writing Studio**: Full-screen markdown studio generating a LinkedIn post.
- [ ] **Creator Profile**: View of extracted metrics (Tone, Reading Level).
- [ ] **Conversation History**: Sidebar showing past chat sessions.
- [ ] **Mobile View**: Narrow-width captures of the dashboard.

---

## 3. GIF Checklist 🎥

Record under 15 seconds. Use tools like *ScreenToGif* (Windows) or *CleanshotX* (macOS). Optimize bounds to focus entirely on the action.

- [ ] `demo_upload_workflow.gif`: Dragging a PDF, seeing parsing status, hitting "Indexed".
- [ ] `demo_chat_rag.gif`: Writing a complex query, the "Thinking..." status, and the immediate SSE text stream start.
- [ ] `demo_streaming.gif`: Ultra-focused macro shot showing the cursor typing out LLM tokens.
- [ ] `demo_writing_studio.gif`: Configuring "LinkedIn Post" constraint, generating, and outputting the cloned personality.
- [ ] `demo_workspace_switch.gif`: Toggling isolation scopes and watching RAG memory explicitly switch context immediately.
- [ ] `demo_dashboard.gif`: Scrolling the live analytics timeline metrics dynamically loading.

---

## 4. GitHub Social Preview Recommendation (OpenGraph)

**Dimensions:** 1280x640 `.png`
**Content:** Deep dark background (#0f172a), glowing indigo accents (#4f46e5). Large bold "CreatorMind AI" typography. Float overlapping UI elements showing the "Writing Studio" cascading over the "RAG Upload" modal.
**Action:** Upload this preview under `Settings -> General -> Social preview`.

---

## 5. Repository Banner Recommendation

Place this explicitly at the very top of `README.md`.
**Dimensions:** 1920x600 `.png`
**Content:** Same aesthetic as the Social Preview but wider. Adds the tagline: *"A Next-Generation AI Content Engine Powered by IBM Watsonx"* along with badging for IBM AI Builders.

---

## 6. Logo Usage Recommendation

- **Light Mode README:** Use a dark-charcoal SVG logo.
- **Dark Mode README:** Use a bright-indigo SVG logo.
- **Favicon:** The 'Brain' motif surrounded by the RAG 'Sparkles'. Needs a clean 32x32 transparent PNG mapping.

---

## 7. README Image Placement Plan

1. **Header:** `promo_github_banner.png` (Top of file)
2. **Logo:** Centered right under the banner `logo_dynamic.svg`.
3. **Features Matrix:** Insert `view_dashboard_dark.png` alongside the value proposition.
4. **Demo Section:** Imbed `demo_chat_rag.gif` aggressively to catch scrolling attention.
5. **Architectural Overview:** Imbed `arch_rag_pipeline.png` to validate technical complexity immediately to engineers.
6. **Writing Studio:** Imbed `view_writing_studio_dark.png` next to the Creator Profile explanation showcasing the LLM injection.

---

## 8. Best GitHub Presentation Practices

1. **Always Use Auto-Playing GIFs over Static Images:** Code repos are visually dry. Gifs prove the software actually works.
2. **Badges:** Placed exactly underneath the logo to immediately declare the stack bounding the developer's attention (React, FastAPI, IBM).
3. **Light/Dark Mode SVG Handling:** Use GitHub's native context picture linking: 
   ```html
   <picture>
     <source media="(prefers-color-scheme: dark)" srcset="logo-dark.png">
     <source media="(prefers-color-scheme: light)" srcset="logo-light.png">
     <img alt="CreatorMind Logo" src="logo-default.png">
   </picture>
   ```
4. **Emoji Minimization:** Keep emojis reserved exclusively for header tags mapping H2/H3 bounds. Do not sprinkle them into paragraphs.
5. **Explicit Citations:** Heavily highlight "IBM Watsonx" and "Granite" in the `H1` abstracts to surface properly during the Hackathon judge scraping.
