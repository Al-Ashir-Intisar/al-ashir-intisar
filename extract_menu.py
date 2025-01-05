import pandas as pd

# Meal data extracted from the PDF in structured format
meal_data = {
    "Meal": ["Breakfast", "Brunch", "Dinner"],
    "Food_Items": [
        [
            "Country Vegetable Scramble"
        ],
        [
            "Kornder Farms Beef Burger",
            "Herb Roasted Chicken Breast",
            "Malibu Burger",
            "Fries",
            "House Made Warm Apple Crisp Streusel",
            "House-Made Marinara",
            "Creamy Garlic Alfredo",
            "Roasted Seasonal Vegetables",
            "Five Cheese Garlic Bread Sticks"
        ],
        [
            "Al Pastor Pork",
            "Chicken Mole",
            "Adobo Lentils",
            "White Rice",
            "Brown Rice",
            "Kornder Farms Beef Burger",
            "Herb Roasted Chicken Breast",
            "Malibu Burger",
            "Fries",
            "House-Made Marinara",
            "Creamy Garlic Alfredo",
            "Roasted Seasonal Vegetables",
            "Five Cheese Garlic Bread Sticks",
            "Grasshopper Cake",
            "Banana Cream Pie Parfait",
            "Boston Cream Cake",
            "Kit Kat Blondie Bar"
        ]
    ]
}

# Convert the data to a DataFrame
df = pd.DataFrame({
    "Meal": meal_data["Meal"],
    "Food_Items": [", ".join(items) for items in meal_data["Food_Items"]]
})

# Generate a properly formatted JSON file
json_path = "meal_data.json"

# Save as an array of objects
df.to_json(json_path, orient="records", indent=2)

print(f"JSON file saved to: {json_path}")
