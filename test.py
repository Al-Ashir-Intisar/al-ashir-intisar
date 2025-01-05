import json
import csv

# File paths
json_file_path = "latest_menu.json"
csv_file_path = "latest_menu.csv"

# Load the JSON data
with open(json_file_path, "r") as json_file:
    data = json.load(json_file)

# Flatten JSON data for CSV
rows = []
for category, items in data.items():
    for item in items:
        rows.append({"Category": category, "Item": item})

# Write the data to a CSV file
with open(csv_file_path, "w", newline="") as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=["Category", "Item"])
    writer.writeheader()  # Write the header
    writer.writerows(rows)  # Write rows

print(f"CSV file successfully written to {csv_file_path}")
