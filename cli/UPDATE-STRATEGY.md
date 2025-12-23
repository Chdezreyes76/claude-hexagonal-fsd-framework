# Update Strategy Documentation

## Overview

The `update` command uses a **selective clean copy strategy** to update framework files in existing projects while preserving user customizations.

## Process Flow

### 1. Backup (Step 3)
- Creates timestamped backup: `.claude/backup-{date}_{time}/`
- Copies entire `.claude/` directory (excluding previous backups)
- Ensures no data loss if update fails

### 2. Copy Framework Files (Step 4)

The framework copies files from the following directories:

| Source | Destination | Clean Copy | Notes |
|--------|-------------|------------|-------|
| `core/agents/` | `.claude/agents/` | ❌ No | Overwrite existing files |
| `core/commands/` | `.claude/commands/` | ❌ No | Overwrite existing files |
| `core/skills/` | `.claude/skills/` | ✅ **Yes** | Complete rebuild (v1.3.1 structural change) |
| `templates/` | `.claude/lib/templates/` | ❌ No | Code templates for scaffolding |
| `core/settings.json.tmpl` | `.claude/settings.json.tmpl` | ❌ No | Settings template |

### 3. Protected Files

The following files are **never overwritten** to preserve user customizations:

- `*.custom.*` - User-customized framework files
- `email-config.json` - User's email configuration
- `README.md` - User's documentation

### 4. Template Processing (Step 5)

Processes Mustache variables in framework files:
- ✅ Processes: `agents/`, `commands/`, `skills/`, `settings.json.tmpl`
- ❌ Skips: `lib/templates/` (code templates processed by scaffold commands)

## Clean Copy Strategy

### What is Clean Copy?

**Clean Copy** = Delete destination directory before copying (complete rebuild)

### When to Use Clean Copy?

Use `cleanCopy: true` when:
- Directory structure changed between versions
- Files were renamed or reorganized
- Old structure would conflict with new structure

### Example: Skills Restructure (v1.3.0 → v1.3.1)

**Old Structure (v1.3.0):**
```
.claude/skills/
├── hexagonal-architecture.md
├── feature-sliced-design.md
└── github-workflow.md
```

**New Structure (v1.3.1):**
```
.claude/skills/
├── hexagonal-architecture/
│   └── skill.md
├── feature-sliced-design/
│   └── skill.md
└── github-workflow/
    └── skill.md
```

**Without Clean Copy:**
```
.claude/skills/
├── hexagonal-architecture.md           ← ❌ Orphaned file
├── hexagonal-architecture/skill.md     ← ✅ New file
├── feature-sliced-design.md            ← ❌ Orphaned file
└── ...
```

**With Clean Copy:**
```
.claude/skills/
├── hexagonal-architecture/skill.md     ← ✅ Clean structure
├── feature-sliced-design/skill.md      ← ✅ Clean structure
└── ...
```

## Adding New Directories to Update

To add a new directory to the update process:

1. Edit `cli/lib/update.js`
2. Add entry to `directoriesToCopy` array:

```javascript
const directoriesToCopy = [
  // ... existing entries
  {
    src: 'source/path',           // Path in framework repo
    dest: 'destination/path',     // Path in .claude/
    cleanCopy: false,             // true = delete before copy
    isFile: false                 // true if copying a single file
  }
];
```

3. Set `cleanCopy: true` if directory structure changed
4. Document the change in CHANGELOG.md

## Version-Specific Migrations

For version-specific migrations, add logic in Step 3.5 (before file copy):

```javascript
// After Step 3 (backup), before Step 4 (copy)
if (currentVersion === '1.2.0' && targetVersion === '1.3.0') {
  await migrateSpecificChanges(claudeDir);
}
```

## Rollback Process

If update fails:

1. Stop the update process
2. Delete `.claude/` directory (corrupted state)
3. Restore from backup:
   ```bash
   cp -r .claude/backup-{timestamp}/* .claude/
   ```
4. Verify with:
   ```bash
   cat .claude/claude.config.json
   ```

## Testing Update Process

Before releasing a new version:

1. Create test project with previous version
2. Run update with `--dry-run`:
   ```bash
   node cli/index.js update /path/to/test-project --dry-run --verbose
   ```
3. Verify output shows correct files updated/copied
4. Run actual update:
   ```bash
   node cli/index.js update /path/to/test-project --verbose
   ```
5. Verify no orphaned files exist
6. Test framework commands still work
