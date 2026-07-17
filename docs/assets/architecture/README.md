# Architecture Diagrams Folder

Store all rendered architecture diagram images here. These are referenced directly from `README.md` and the `docs/diagrams/` Mermaid source files.

## Naming Convention

`arch_[component].png`

## Required Exports

| Filename | Source Diagram | Description |
|----------|---------------|-------------|
| `arch_system_overview.png` | `SYSTEM_ARCHITECTURE.md` | High-level system topology |
| `arch_rag_pipeline.png` | `RAG_PIPELINE.md` | Full RAG ingestion & retrieval flow |
| `arch_database_er.png` | `DATABASE_ER_DIAGRAM.md` | Entity-relationship schema |
| `arch_component_map.png` | `COMPONENT_DIAGRAM.md` | Module boundaries map |
| `arch_sequence.png` | `SEQUENCE_DIAGRAM.md` | Upload → Chat → Stream runtime |
| `arch_deployment.png` | `DEPLOYMENT_DIAGRAM.md` | Docker/Nginx deployment map |
| `arch_data_flow.png` | `DATA_FLOW_DIAGRAM.md` | User to AI data flow |

## How to Generate
Use [Mermaid Live Editor](https://mermaid.live/) or the **Mermaid CLI** to export the `.md` Mermaid diagrams as `.png` or `.svg`:
```bash
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/SYSTEM_ARCHITECTURE.md -o docs/assets/architecture/arch_system_overview.png
```
