# 🛡️ AITAG: In-Memory Repository Session Architecture

> **Zero-Disk-Pollution AI Agent Workspace**: Clones remote Git repositories into ephemeral RAM buffers, executes AI code refactoring entirely in memory, runs pre-flight AST assertions, and gates physical commits behind Human-in-the-Loop (HITL) approval.

---

## 🏗️ Architecture

```
[GitHub / Remote Repo]
        │ (In-Memory Clone / Tree Fetch)
        ▼
[InMemoryRepoSession (RAM VFS)]
        │
        ├─ 1. In-Memory Reads & Writes (Zero Disk I/O)
        ├─ 2. Sub-millisecond Checkpoints (`create_checkpoint` / `restore_checkpoint`)
        ├─ 3. Virtual AST & Syntax Assertions (`run_virtual_verification`)
        ├─ 4. Live Unified Diff Generation (`generate_diff`)
        │
        ▼ (Only when Approved by Human)
[Physical Disk Export / GitHub Commit]
```

---

## 🚀 Quickstart

```python
from in_memory_repo_session_manager import InMemoryRepoSession

# 1. Initialize session in RAM
session = InMemoryRepoSession(repo_owner="Maqsood32595", repo_name="AITAG")

# 2. Checkpoint clean state
session.create_checkpoint("before_edit")

# 3. AI mutates file in RAM
session.write_file("README.md", "# AITAG (Updated in RAM)\n")

# 4. Generate Diff for Human Review
print(session.generate_diff())

# 5. Rollback or Commit
# session.restore_checkpoint("before_edit") # Instant Rollback in RAM
# session.export_to_disk("./output", hitl_approved=True) # Commit to Disk
```
