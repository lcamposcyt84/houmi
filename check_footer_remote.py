import subprocess
import os

repo_dir = r"c:\xampp\htdocs\houmi-master"

# Get remote branches
print("--- REMOTE BRANCHES ---")
res = subprocess.run(["git", "branch", "-r"], cwd=repo_dir, capture_output=True, text=True)
print(res.stdout)
print(res.stderr)

# List all files containing Footer in srbaddour remotes
print("--- SEARCH FOR FOOTER IN SRBADDOUR ---")
res2 = subprocess.run(["git", "ls-tree", "-r", "--name-only", "srbaddour/master"], cwd=repo_dir, capture_output=True, text=True)
for line in res2.stdout.splitlines():
    if "Footer" in line or "footer" in line.lower():
        print(f"Found Footer in master: {line}")

# Try srbaddour/main as well if it exists
res3 = subprocess.run(["git", "ls-tree", "-r", "--name-only", "srbaddour/main"], cwd=repo_dir, capture_output=True, text=True)
for line in res3.stdout.splitlines():
    if "Footer" in line or "footer" in line.lower():
        print(f"Found Footer in main: {line}")
