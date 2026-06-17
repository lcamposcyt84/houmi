import subprocess
import os

repo_dir = r"c:\xampp\htdocs\houmi-master"

try:
    print("--- GIT STATUS ---")
    status = subprocess.run(["git", "status"], cwd=repo_dir, capture_output=True, text=True)
    print(status.stdout)

    print("--- GIT PUSH ---")
    push = subprocess.run(["git", "push", "origin", "master"], cwd=repo_dir, capture_output=True, text=True)
    print("STDOUT:", push.stdout)
    print("STDERR:", push.stderr)

except Exception as e:
    print("Error:", str(e))
