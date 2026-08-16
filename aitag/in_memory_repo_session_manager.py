"""
In-Memory Repository Session Manager (RAM VFS Sandbox)
======================================================
Provides full in-memory cloning, mutation, AST verification, checkpointing,
and diff generation for remote Git repositories (e.g., GitHub) without writing
a single byte to local disk.

Repository Target: Maqsood32595/AITAG
"""

import urllib.request
import json
import base64
import copy
import difflib
import sys
from typing import Dict, List, Optional, Tuple, Any, Callable

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


class InMemoryRepoSession:
    """
    Manages an entire Git repository in RAM.
    Supports in-memory reads, writes, checkpoints, AST assertions, and diff generation.
    """
    def __init__(
        self, 
        repo_owner: str = "Maqsood32595", 
        repo_name: str = "AITAG", 
        branch: str = "main", 
        auth_token: Optional[str] = None
    ):
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.branch = branch
        self.auth_token = auth_token
        
        # ── In-Memory State ───────────────────────────────────────────────────
        self.files: Dict[str, str] = {}                  # Active working tree in RAM
        self.base_snapshot: Dict[str, str] = {}           # Ground truth from initial fetch
        self.checkpoints: Dict[str, Dict[str, str]] = {}  # Named snapshot save points
        self.session_log: List[Dict[str, Any]] = []       # Audit trail of AI mutations
        
        print(f"🚀 Initializing in-memory session for {repo_owner}/{repo_name} (branch: {branch})...")
        self._load_from_github()

    def _load_from_github(self):
        """Fetches repository tree and file contents directly into RAM via GitHub API."""
        api_url = f"https://api.github.com/repos/{self.repo_owner}/{self.repo_name}/git/trees/{self.branch}?recursive=1"
        req = urllib.request.Request(api_url)
        req.add_header("User-Agent", "InMemoryRepoSession/1.0")
        if self.auth_token:
            req.add_header("Authorization", f"Bearer {self.auth_token}")

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                
            tree = data.get("tree", [])
            for item in tree:
                if item.get("type") == "blob": # Blob represents a file
                    file_url = item["url"]
                    file_req = urllib.request.Request(file_url)
                    file_req.add_header("User-Agent", "InMemoryRepoSession/1.0")
                    if self.auth_token:
                        file_req.add_header("Authorization", f"Bearer {self.auth_token}")
                    
                    try:
                        with urllib.request.urlopen(file_req, timeout=10) as file_resp:
                            blob_data = json.loads(file_resp.read().decode())
                            content = base64.b64decode(blob_data["content"]).decode("utf-8", errors="ignore")
                            self.files[item["path"]] = content
                    except Exception as fe:
                        print(f"⚠️ Could not fetch file {item['path']}: {fe}")

            self.base_snapshot = copy.deepcopy(self.files)
            print(f"✅ [LOADED TO RAM] {len(self.files)} files successfully loaded into RAM.")
        except Exception as e:
            print(f"⚠️ Notice: Remote GitHub fetch failed or repo empty ({e}).")
            print("📦 Initialized with clean virtual in-memory tree.")

    # ── In-Memory File Operations (Zero Disk I/O) ─────────────────────────────
    def read_file(self, path: str) -> Optional[str]:
        """Reads a file directly from RAM."""
        return self.files.get(path)

    def write_file(self, path: str, content: str, action_desc: str = "AI Mutation"):
        """Writes/modifies a file purely in RAM without touching local disk."""
        self.files[path] = content
        self.session_log.append({
            "action": action_desc,
            "file": path,
            "length": len(content)
        })
        print(f"📝 [RAM WRITE] '{path}' updated ({action_desc}).")

    def delete_file(self, path: str, action_desc: str = "AI Deletion"):
        """Removes a file from the active RAM tree."""
        if path in self.files:
            del self.files[path]
            self.session_log.append({"action": action_desc, "file": path})
            print(f"🗑️ [RAM DELETE] '{path}' removed from memory.")

    def list_files(self) -> List[str]:
        """Lists all file paths currently held in RAM."""
        return sorted(list(self.files.keys()))

    # ── In-Memory Checkpoints & Instant Rollbacks ──────────────────────────────
    def create_checkpoint(self, name: str):
        """Creates a sub-millisecond named snapshot of current memory state."""
        self.checkpoints[name] = copy.deepcopy(self.files)
        print(f"📌 [CHECKPOINT CREATED] '{name}' ({len(self.files)} files).")

    def restore_checkpoint(self, name: str) -> bool:
        """Restores working memory back to a named checkpoint in 0ms."""
        if name in self.checkpoints:
            self.files = copy.deepcopy(self.checkpoints[name])
            print(f"⏪ [CHECKPOINT RESTORED] Reverted RAM state to '{name}'.")
            return True
        print(f"❌ Checkpoint '{name}' not found.")
        return False

    def reset_to_base(self):
        """Discards all AI experiments and reverts to original GitHub state."""
        self.files = copy.deepcopy(self.base_snapshot)
        print("🔄 [RESET] Discarded all session mutations. Reverted to base state.")

    # ── In-Memory AST / Unit Verification Sandbox ─────────────────────────────
    def run_virtual_verification(
        self, 
        verifier_fn: Callable[[Dict[str, str]], Tuple[bool, str]]
    ) -> Tuple[bool, str]:
        """
        Executes dry-run assertions on the RAM state.
        If verification fails, call self.reset_to_base() to leave 0 trace.
        """
        return verifier_fn(self.files)

    # ── Unified Diff Generation (For Human-In-The-Loop Review) ────────────────
    def generate_diff(self) -> str:
        """Generates standard git-style unified diff comparing RAM state to base."""
        diff_lines = []
        all_paths = set(self.base_snapshot.keys()).union(set(self.files.keys()))
        
        for path in sorted(all_paths):
            old_content = self.base_snapshot.get(path, "")
            new_content = self.files.get(path, "")
            if old_content != new_content:
                diff = difflib.unified_diff(
                    old_content.splitlines(keepends=True),
                    new_content.splitlines(keepends=True),
                    fromfile=f"a/{path}",
                    tofile=f"b/{path}"
                )
                diff_lines.extend(diff)
        return "".join(diff_lines)

    # ── Optional Physical Export (HITL Gated) ─────────────────────────────────
    def export_to_disk(self, output_dir: str, hitl_approved: bool = False) -> bool:
        """
        Physically writes the verified RAM state to disk ONLY if HITL approval is True.
        """
        if not hitl_approved:
            print("⛔ [HITL BLOCKED] Export aborted. Physical disk remains untouched.")
            return False
            
        import os
        from pathlib import Path
        out_path = Path(output_dir).resolve()
        print(f"🚀 [HITL APPROVED] Exporting {len(self.files)} files to {out_path}...")
        
        for rel_path, content in self.files.items():
            file_dest = out_path / rel_path
            file_dest.parent.mkdir(parents=True, exist_ok=True)
            with open(file_dest, "w", encoding="utf-8") as f:
                f.write(content)
                
        print("✅ [EXPORT COMPLETE] Successfully synced RAM state to disk.")
        return True


# ── Interactive Example Usage ─────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 70)
    print("DEMO: IN-MEMORY REPOSITORY SESSION MANAGER (AITAG)")
    print("=" * 70)
    
    # 1. Initialize RAM Session for Maqsood32595/AITAG
    session = InMemoryRepoSession(repo_owner="Maqsood32595", repo_name="AITAG")
    
    # 2. Save a clean checkpoint
    session.create_checkpoint("initial_clean")
    
    # 3. Simulate AI generating a new feature entirely in RAM
    session.write_file(
        "src/tag_generator.py",
        "def generate_tags(content: str):\n    return [w.lower() for w in content.split() if len(w) > 4]\n",
        action_desc="AI: Create tag_generator module"
    )
    
    # 4. In-Memory Validation (0-token Python syntax check in RAM)
    def verify_syntax(v_files):
        code = v_files.get("src/tag_generator.py", "")
        try:
            compile(code, "<string>", "exec")
            return True, "AST Syntax Check Passed"
        except Exception as e:
            return False, f"Syntax Error: {e}"
            
    passed, log = session.run_virtual_verification(verify_syntax)
    print(f"\n🔍 In-Memory Verification Result: {log} (Passed: {passed})")
    
    # 5. Generate Diff for Human Review
    print("\n--- UNIFIED DIFF (RAM vs BASE) ---")
    diff_output = session.generate_diff()
    print(diff_output if diff_output else "(No changes)")
    print("-" * 34)
