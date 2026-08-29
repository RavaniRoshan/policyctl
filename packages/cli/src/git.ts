import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import type { CiContext, DiffFile, FileStatus } from "@policyctl/core";

// The well-known hash of an empty Git tree; used as a diff base when there is no HEAD yet.
const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

function parseNameStatus(out: string): DiffFile[] {
  const files: DiffFile[] = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const [statusField, ...paths] = line.split("\t");
    const letter = (statusField[0] ?? "M") as FileStatus;
    // rename/copy: "R100\told\tnew" -> use the new (last) path
    const path = paths[paths.length - 1];
    if (path) files.push({ path, status: letter });
  }
  return files;
}

function diffArgs(from?: string, to?: string): string[] {
  if (from && to) return [from, to];
  if (from) return [from];
  return ["HEAD"];
}

function resolves(ref: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--verify", "-q", ref], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** Split a unified diff into per-file hunks so we can drop excluded files' content. */
function splitDiffByFile(patch: string): { path: string; hunk: string }[] {
  const out: { path: string; hunk: string }[] = [];
  for (const hunk of patch.split(/^(?=diff --git )/m)) {
    if (!hunk.startsWith("diff --git ")) continue;
    const m = hunk.match(/^diff --git a\/(.*?) b\/(.*?)(?:\n|$)/);
    const path = m ? (m[2] || m[1] || "") : "";
    out.push({ path, hunk });
  }
  return out;
}

/**
 * Build a CiContext by running `git diff` in the current working directory.
 * Unlike a bare `git diff HEAD`, this also captures untracked files (via a
 * temporary intent-to-add that is reverted) and works in a repo with no commits.
 *
 * `exclude` paths (e.g. the policy file itself) are removed from both the file
 * list and the diff text so the policy can't trip its own rules.
 */
export function getCiContext(
  from?: string,
  to?: string,
  exclude: string[] = [],
): CiContext {
  const excluded = new Set(exclude.map((p) => basename(p)));
  const dArgs = diffArgs(from, to);
  const base = from ?? "HEAD";
  const resolvedBase = resolves(base) ? base : EMPTY_TREE;

  let nameStatus = "";
  let patch = "";
  try {
    nameStatus = execFileSync("git", ["diff", "--name-status", ...dArgs], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    /* not a git repo, or no diff */
  }
  try {
    patch = execFileSync("git", ["diff", "-p", "--no-color", ...dArgs], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    /* ignore */
  }

  let files = parseNameStatus(nameStatus);

  // `git diff` ignores untracked files; surface them as additions without touching the user's index.
  let untracked: string[] = [];
  try {
    untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch {
    /* ignore */
  }
  if (untracked.length > 0) {
    try {
      execFileSync("git", ["add", "--intent-to-add", "--", ...untracked], {
        stdio: "ignore",
      });
      const uNs = execFileSync("git", ["diff", "--name-status", resolvedBase], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const uPatch = execFileSync("git", ["diff", "-p", "--no-color", resolvedBase], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      patch += "\n" + uPatch;
      files = files.concat(
        parseNameStatus(uNs).filter((f) => untracked.includes(f.path)),
      );
    } catch {
      /* ignore */
    } finally {
      try {
        execFileSync("git", ["reset", "-q", "--", ...untracked], { stdio: "ignore" });
      } catch {
        /* ignore */
      }
    }
  }

  if (excluded.size > 0) {
    files = files.filter((f) => !excluded.has(basename(f.path)));
    patch = splitDiffByFile(patch)
      .filter((p) => !excluded.has(basename(p.path)))
      .map((p) => p.hunk)
      .join("");
  }

  return { files, text: patch };
}
