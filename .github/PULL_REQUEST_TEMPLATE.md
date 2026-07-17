## Description
Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context.

Fixes # (issue)

## Type of change
Please delete options that are not relevant.
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Security & Multi-Tenant Boundaries
CreatorMind relies on strict isolation constraints. **If you touched Database access, API routing, or Vector similarities:**
- [ ] I have verified `$and` logic on `workspace_id` filters.
- [ ] I have checked JWT mapping bounds.
- [ ] I have run SQLite tests expecting explicit Foreign Key constraints.

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings (Check Vite ESBuild logs)
- [ ] I have checked that IBM Granite Prompt structures remain strictly aligned.
