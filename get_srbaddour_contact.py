import subprocess
import sys

repo_dir = r"c:\xampp\htdocs\houmi-master"

# The srbaddour remote was already fetched, so srbaddour/master exists locally
# Get the contact page content
file_path = "houmi-store-vite/src/app/(store)/contact/page.tsx"

result = subprocess.run(
    ["git", "show", f"srbaddour/master:{file_path}"],
    cwd=repo_dir,
    capture_output=True,
    text=True,
    encoding="utf-8"
)

if result.returncode == 0:
    output_file = r"c:\xampp\htdocs\houmi-master\srbaddour_contact_page.tsx"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result.stdout)
    print(f"SUCCESS: Contact page saved to {output_file}")
    print(f"Lines: {len(result.stdout.splitlines())}")
    print("--- PREVIEW (first 30 lines) ---")
    for i, line in enumerate(result.stdout.splitlines()[:30], 1):
        print(f"{i}: {line}")
else:
    print("ERROR:", result.stderr)
    # Try listing what's available at that path
    result2 = subprocess.run(
        ["git", "ls-tree", "srbaddour/master", "houmi-store-vite/src/app/"],
        cwd=repo_dir,
        capture_output=True,
        text=True
    )
    print("Available at houmi-store-vite/src/app/:")
    print(result2.stdout)
