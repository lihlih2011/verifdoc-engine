import re

path = 'c:\\Users\\chaou\\Desktop\\VerifDoc Beta\\core\\reporting.py'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Em Dash and En Dash specificially
content = content.replace('\u2014', '-').replace('\u2013', '-')

# Replace Smart Quotes
content = content.replace('\u2019', "'").replace('\u2018', "'").replace('\u201C', '"').replace('\u201D', '"')

# Replace Non-Breaking Space
content = content.replace('\u00A0', ' ')

# Regex to find any remaining non-ascii and print them
remaining = [c for c in content if ord(c) > 127]
if remaining:
    print(f"Found remaining non-ascii: {set(remaining)}")
    # Force replace
    content = re.sub(r'[^\x00-\x7F]', '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sanitization complete.")
