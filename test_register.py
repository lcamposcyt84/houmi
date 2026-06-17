import urllib.request
import urllib.error
import json

url = "https://api.houmi.shop/auth/register.php"
data = {
    "firstName": "Leonardo",
    "lastName": "Campos",
    "email": "lcamposcyt@gmail.com",
    "password": "Password123",
    "phone": "+5804245547749"
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = response.read().decode('utf-8')
        print("Success:", result)
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print("Error:", str(e))
