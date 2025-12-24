
import webbrowser
import time
import urllib.request
import sys

url = "http://localhost:8000/analysis"
print(f"Waiting for {url} to be available...")

max_retries = 10
for i in range(max_retries):
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                print("Server is UP!")
                break
    except Exception as e:
        print(f"Waiting... ({i+1}/{max_retries})")
        time.sleep(1)
else:
    print("Server not responding after 10s. Opening anyway.")

print(f"Opening browser to {url} ...")
webbrowser.open(url)
