import json
import re

file_path = r"C:\Users\CamposDEv\.gemini\antigravity-ide\brain\ae385068-1bea-493c-8fbd-8a4c7f8ff4b3\.system_generated\steps\273\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# The JSON starts after the marker
json_start = content.find('{"sha":')
if json_start != -1:
    json_data = json.loads(content[json_start:])
    tree = json_data.get("tree", [])
    
    print(f"Total files in tree: {len(tree)}")
    
    # Search for Footer
    footers = [item["path"] for item in tree if "footer" in item["path"].lower()]
    print("\n--- Footer files found ---")
    for f in footers:
        print(f)
        
    # Search for tsx, ts, jsx, js files
    code_files = [item["path"] for item in tree if re.search(r"\.(tsx|ts|jsx|js|php|css|html)$", item["path"])]
    print("\n--- Code files found ---")
    for cf in code_files[:50]:
        print(cf)
    if len(code_files) > 50:
        print(f"... and {len(code_files) - 50} more code files")
else:
    print("Could not find JSON in file")
