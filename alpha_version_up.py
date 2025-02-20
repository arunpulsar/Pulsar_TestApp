import re

# Define the versioning file
html_file = "index.html"

# Read the file content
with open(html_file, "r", encoding="utf-8") as file:
    content = file.read()

# Find the current version using regex
match = re.search(r"&alpha;(\d+)\.(\d+)\.(\d+)", content)

if match:
    major, minor, patch = map(int, match.groups())

    # Increment patch by default
    patch += 1

    # If patch reaches 10, reset and increment minor
    if patch >= 10:
        patch = 0
        minor += 1

    # If minor reaches 10, reset and increment major
    if minor >= 10:
        minor = 0
        major += 1

    # New version string
    new_version = f"&alpha;{major}.{minor}.{patch}"

    # Replace the old version with the new one
    updated_content = re.sub(r"&alpha;\d+\.\d+\.\d+", new_version, content)

    # Write back to the file
    with open(html_file, "w", encoding="utf-8") as file:
        file.write(updated_content)

    print(f"Updated to version {new_version}")
else:
    print("Version not found in the file.")
