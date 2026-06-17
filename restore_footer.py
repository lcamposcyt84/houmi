import subprocess

repo_dir = r"c:\xampp\htdocs\houmi-master"

# Get the Footer.tsx from the commit BEFORE the big push (d2b48f2...)
result = subprocess.run(
    ["git", "show", "d2b48f284204ed8c4e9b0ffeaae69ced05eba108:houmi-store-vite/src/components/layout/Footer.tsx"],
    cwd=repo_dir,
    capture_output=True,
    text=True,
    encoding="utf-8"
)

if result.returncode == 0:
    with open(r"c:\xampp\htdocs\houmi-master\houmi-store-vite\src\components\layout\Footer.tsx", "w", encoding="utf-8") as f:
        f.write(result.stdout)
    print("SUCCESS: Footer.tsx restored from previous commit")
    print(f"Content length: {len(result.stdout)} chars")
else:
    print("ERROR:", result.stderr)
