import subprocess

repo_dir = r"c:\xampp\htdocs\houmi-master"

# The Vercel deploy used commit d2b48f2 - the big feat commit
# Let's get the contact page from that commit
commits_to_try = [
    "d2b48f284204ed8c4e9b0ffeaae69ced05eba108",
    "HEAD~1",
    "HEAD~2", 
    "HEAD~3",
]

file_path = "houmi-store-vite/src/app/(store)/contact/page.tsx"

for commit in commits_to_try:
    result = subprocess.run(
        ["git", "show", f"{commit}:{file_path}"],
        cwd=repo_dir,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env={**__import__('os').environ, 'GIT_REDIRECT_STDERR': '2>&1'}
    )
    if result.returncode == 0 and len(result.stdout) > 500:
        output_file = r"c:\xampp\htdocs\houmi-master\contact_from_vercel.tsx"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(result.stdout)
        print(f"SUCCESS from commit {commit}")
        print(f"Size: {len(result.stdout)} bytes, Lines: {len(result.stdout.splitlines())}")
        print("--- First 50 lines ---")
        for i, line in enumerate(result.stdout.splitlines()[:50], 1):
            print(f"{i}: {line}")
        break
    else:
        print(f"Commit {commit}: returned {result.returncode}, size={len(result.stdout)}")
        if result.stderr:
            print(f"  stderr: {result.stderr[:200]}")
else:
    # If none worked, list commits
    log = subprocess.run(
        ["git", "log", "--oneline", "-10"],
        cwd=repo_dir,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    print("Git log (last 10 commits):")
    print(log.stdout)
    
    # Also check what files exist in the current HEAD for the contact page
    show = subprocess.run(
        ["git", "show", f"HEAD:{file_path}"],
        cwd=repo_dir,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env={**__import__('os').environ, 'GIT_REDIRECT_STDERR': '2>&1'}
    )
    print(f"\nHEAD contact page ({len(show.stdout)} bytes):")
    print(show.stdout[:500])
