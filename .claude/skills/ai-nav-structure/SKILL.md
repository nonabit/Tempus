---
name: ai-nav-structure
description: Project organization methodology for AI-assisted development with Claude Code or similar tools. Use when users want to set up a navigation system for large-scale AI code generation projects (10k+ lines), need to help AI maintain architectural consistency across sessions, or want to establish folder-level indexing to help AI understand project structure and locate files efficiently.
---

# AI Navigation Structure

A methodology for organizing AI-assisted development projects using folder-level README files and minimal file annotations. Designed to help AI tools (especially Claude Code) maintain global awareness and architectural consistency in large codebases.

## Core Concept

Create a "navigation system" through three components:

1. **Root architecture document** - Project-wide overview
2. **Folder-level index files** - README.md in each major folder describing its contents
3. **File update reminders** - Single-line comment prompting AI to update folder indices

This creates a self-similar (fractal-like) structure where each level has the same pattern: a description of what's there and what each piece does.

## Implementation Steps

### 1. Initialize Root Documentation

Create `/README.md` in the project root with:

```markdown
# Project Name

## AI Navigation Convention
This project uses folder-level indexing:
- Each major folder has README.md describing its role and file list
- Source files include: `// 📁 Folder structure changed, update ./README.md`
- When adding/removing/renaming files, update the folder's README.md

## Tech Stack
[List key technologies, frameworks, libraries]

## Architecture
- /src/components - UI components
- /src/hooks - Custom React hooks
- /src/api - API request layer
- /src/pages - Page components
- /src/utils - Utility functions

## Key Design Decisions
- [Important architectural choices]
- [Conventions that AI should follow]
```

### 2. Create Folder-Level Indices

For each major module folder (components, hooks, api, pages, utils, etc.), create `README.md`:

**Template:**
```markdown
## [Folder Name]

[One-line description of folder's purpose]

**[Category 1]:**
- filename.ts - Brief description (what it does, who uses it)
- filename.ts - Brief description

**[Category 2]:**
- filename.ts - Brief description

**Conventions:**
- [Any special rules for this folder]
```

**Keep indices concise:**
- 3-10 lines per folder ideal
- Focus on "what" and "for whom", not implementation details
- Group by function, not alphabetically

### 3. Add File Update Reminders

At the top of each source file, add a single-line comment:

```typescript
// 📁 Folder structure changed, update ./README.md

import ...
```

This reminds AI to update the folder's README when modifying files in that folder.

### 4. Train AI to Follow Convention

First 5-10 interactions with AI, explicitly remind:

```
"Create a Toast component in /components and update that folder's README.md"
```

After initial training, AI should autonomously maintain indices:

```
"Create a useLocalStorage hook"
→ AI creates /hooks/useLocalStorage.ts
→ AI updates /hooks/README.md
```

### 5. Maintain Regularly

- **Daily/weekly**: Scan folder READMEs for drift from actual files
- **During refactoring**: Update README before or immediately after structural changes
- **When AI forgets**: Remind explicitly and reinforce the pattern

## Best Practices

### ✅ Do

- Keep READMEs under 10 lines when possible
- Update indices immediately when adding/removing files
- Group files by function/purpose, not alphabetically
- Use consistent format across all folder READMEs
- Combine with TypeScript types and good naming conventions

### ⚠️ Consider

- Only create READMEs for major module folders (1-2 levels deep)
- Skip READMEs for deeply nested subfolders unless truly necessary
- Periodically verify AI is maintaining indices (don't assume)

### ❌ Avoid

- Writing implementation details in README (code comments handle that)
- Creating README for every single folder (too much overhead)
- Treating "3 lines" as rigid rule (it's a guideline for brevity)
- Depending solely on AI to maintain without human oversight
- Over-engineering with additional metadata beyond simple descriptions

## Why This Works

**For AI tools:**
- Quick orientation when entering a folder
- Understanding of file relationships and dependencies
- Trigger to update documentation when making changes
- Maintains architectural awareness across sessions

**For humans:**
- Navigable project structure
- Onboarding aid for new developers
- High-level architecture map

**For projects:**
- Consistent organization pattern at every level
- Self-documenting structure
- Lightweight compared to heavy documentation systems

## Limitations

- AI may forget to update indices despite reminders
- Requires periodic manual verification
- Not a substitute for proper architecture planning
- Effectiveness varies by AI tool sophistication
- Can become burden if enforced too rigidly

## Resources

See `references/templates.md` for complete example project structure and README templates ready to copy.