
import webbrowser
import time

url = "http://localhost:8000/analysis"
print(f"Opening {url} ...")
# Wait a brief moment to ensure server is ready
time.sleep(1)
webbrowser.open(url)
print("Browser launched.")
