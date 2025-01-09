import openai
import json
import re

# Prompt for OpenAI API key
api_key = input("Enter your OpenAI API key: ").strip()

# Initialize the client with the API key
client = openai.Client(api_key=api_key)


# Email content
with open("latest_email.txt", "r", encoding="utf-8") as file:
    email_content = file.read()

# Create the structured prompt
prompt = f"""
Extract the menu from the following email text and structure it similar ot this JSON format (include all the items in the email):
[
  {{ "Meal": "Breakfast", "Food_Items": "BANANA CINNAMON FRENCH TOAST @​breakfastfeature"... }},
  {{ "Meal": "Brunch", "Food_Items": "HAM AND SPLIT PEA @​warm&soulful, CURRIED BUTTERNUT SQUASH & COCONUT @​warm&soulful"... }},
  {{ "Meal": "Dinner", "Food_Items": "SESAME ORANGE MINN-TOFU @​near&far, TEMPURA SESAME ORANGE CHICKEN @​near&far"... }}
]
Email text:
{email_content}
"""


# Call the API using the `client.chat.completions.create` method
try:
    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",  # Replace with your specific model version if needed
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts structured data. Only return the json object no need for extra data/explanation."},
            {"role": "user", "content": prompt}
        ]
    )

# Extract JSON from the response
    content = response.choices[0].message.content  # Correctly access the content

    print(content)

    # # Write the result to a .txt file
    with open("latest_menu.txt", "w") as file:
         file.write(content)
    
    output_file_path = 'meal_data.json'

    # Use regex to extract only the JSON content between ```json and the closing ```
    json_match = re.search(r"```json(.*?)```", content, flags=re.DOTALL)

    if json_match:
        cleaned_text = json_match.group(1).strip()
        # Parse the JSON content
        json_data = json.loads(cleaned_text)

        # Write the JSON data to a new .json file
        with open(output_file_path, 'w') as json_file:
            json.dump(json_data, json_file, indent=4)

        print(f"JSON content successfully written to {output_file_path}")
    else:
        print("No valid JSON content found in the file.")

except Exception as e:
    print(f"An error occurred: {e}")
