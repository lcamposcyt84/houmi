import subprocess
import os

target_dir = r"c:\xampp\htdocs\temp_houmi_github"
try:
    if not os.path.exists(target_dir):
        subprocess.run(["git", "clone", "https://github.com/SrBaddour/Houmi.git", target_dir], check=True)
        print("Cloned successfully")
    else:
        print("Directory exists")
        
    # Check if register page exists
    reg_path = os.path.join(target_dir, "src", "app", "(store)", "register", "page.tsx")
    if os.path.exists(reg_path):
        print("Register page EXISTS in SrBaddour/Houmi")
    else:
        print("Register page DOES NOT EXIST in SrBaddour/Houmi")
        
    # Check if db connection exists
    db_path = os.path.join(target_dir, "api", "db.php")
    if os.path.exists(db_path):
        print("db.php EXISTS in SrBaddour/Houmi")
    else:
        print("db.php DOES NOT EXIST in SrBaddour/Houmi")

except Exception as e:
    print("Error:", str(e))
