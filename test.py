import re
import json

# File paths
input_file = "latest_email.txt"
output_file = "meal_schedule.json"

def extract_meal_schedule(file_path):
    with open(file_path, "r") as file:
        content = file.read()

    # Extract the day
    day_pattern = r"(?i)(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([a-zA-Z]+\s+\d+)"
    day_match = re.search(day_pattern, content)
    day = day_match.group(0) if day_match else "Day not found"

    # Extract meal times
    meals = {}
    meal_patterns = {
        "Breakfast": r"BREAKFAST\s+.*?(\d{1,2}:\d{2}\s[apm]+)\s-\s(\d{1,2}:\d{2}\s[apm]+)",
        "Lunch": r"LUNCH\s+.*?(\d{1,2}:\d{2}\s[apm]+)\s-\s(\d{1,2}:\d{2}\s[apm]+)",
        "Dinner": r"DINNER\s+.*?(\d{1,2}:\d{2}\s[apm]+)\s-\s(\d{1,2}:\d{2}\s[apm]+)"
    }

    for meal, pattern in meal_patterns.items():
        match = re.search(pattern, content, re.DOTALL)
        if match:
            meals[meal] = {"start_time": match.group(1), "end_time": match.group(2)}
        else:
            meals[meal] = {"start_time": "Not found", "end_time": "Not found"}

    return {"day": day, "meals": meals}

def save_to_json(data, file_path):
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)
    print(f"Meal schedule saved to {file_path}")

def main():
    # Extract and save the meal schedule
    meal_schedule = extract_meal_schedule(input_file)
    save_to_json(meal_schedule, output_file)

if __name__ == "__main__":
    main()
