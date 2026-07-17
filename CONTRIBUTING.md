# Contributing to CreatorMind AI

First off, thank you for considering contributing to CreatorMind AI! It's people like you that make open-source software such a great community to learn, inspire, and create.

## 1. Where do I go from here?
If you've noticed a bug or have a feature request, make sure to read our **Issues Guidelines**. If you're ready to contribute code, please follow the **Pull Request Process**.

## 2. Setting up your environment
Ensure you have Python 3.10+ and Node.js 18+ installed. Review the `INSTALLATION_GUIDE.md` localized in the `/docs` folder for exact startup hooks. 

## 3. Workflow expectations
- **Branching:** Please branch off `main` utilizing a descriptive prefix (`feat/x`, `fix/y`, `docs/z`).
- **Commits:** Write clear, concise commit messages encapsulating why you made the change. 
- **Tests:** Currently, Python pytests sit under `/backend/tests`. Ensure tests pass locally via `pytest` before filing a Pull Request.

## 4. Pull Request Process
1. Ensure your PR description clearly describes the problem and solution. It should include the relevant issue number if applicable.
2. Ensure you have not broken any multi-tenant boundaries (ensure `$and` keys spanning `workspace_id` remain intact on Chroma queries).
3. The core maintainers will review the PR, request changes if necessary, and merge.

Thank you again for looking into contributing to CreatorMind!
