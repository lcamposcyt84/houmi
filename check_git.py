import subprocess
import os

repo_dir = r"c:\xampp\htdocs\houmi-master"
output_file = r"c:\xampp\htdocs\houmi-master\git_report.txt"

with open(output_file, "w", encoding="utf-8") as f:
    try:
        f.write("Fetching origin...\n")
        subprocess.run(["git", "fetch", "origin"], cwd=repo_dir, check=False)
        
        f.write("\n--- GIT STATUS ---\n")
        status = subprocess.run(["git", "status"], cwd=repo_dir, capture_output=True, text=True)
        f.write(status.stdout + "\n")
        
        f.write("\n--- GIT LOG (Local vs Remote) ---\n")
        log = subprocess.run(["git", "log", "--oneline", "HEAD..origin/main"], cwd=repo_dir, capture_output=True, text=True)
        f.write(log.stdout + "\n")
        
        f.write("\n--- GIT DIFF HEAD ---\n")
        diff = subprocess.run(["git", "diff", "HEAD"], cwd=repo_dir, capture_output=True, text=True)
        f.write(diff.stdout[:4000] + "\n") # truncated if too long
        
    except Exception as e:
        f.write("Error: " + str(e) + "\n")
