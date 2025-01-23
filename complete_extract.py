import requests
import pdfplumber
import json
from bs4 import BeautifulSoup

# URL of the webpage to scrape
url = "https://stolaf.cafebonappetit.com/cafe/stav-hall/#cafe-hours"

# Headers to mimic a browser request
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0 Safari/537.36"
}

# Step 1: Fetch the webpage content
response = requests.get(url, headers=headers)
if response.status_code != 200:
    print(f"Failed to fetch the webpage. Status code: {response.status_code}")
    exit()

# Parse the HTML content
soup = BeautifulSoup(response.content, 'html.parser')

# Step 2: Find the link to "Today's Menu" PDF
menu_container = soup.find('ul', class_='site-panel__daypart-print-menu')
pdf_url = None
if menu_container:
    for a_tag in menu_container.find_all('a', href=True):
        if "Today" in a_tag.text:  # Check if the text contains "Today"
            pdf_url = a_tag['href']
            break

if not pdf_url:
    print("Could not find the 'Today's Menu' link on the page.")
    exit()

# Step 3: Download the PDF file or process HTML content
response = requests.get(pdf_url, headers=headers, stream=True)
content_type = response.headers.get('Content-Type', '')


if 'html' in content_type:
    # Save the response content as HTML for further processing
    html_file = 'response_content.html'
    with open(html_file, 'w', encoding='utf-8') as file:
        file.write(response.text)

    with open(html_file, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file.read(), 'html.parser')

    # Process the HTML content
    menu = {}
    meal_times = {}
    subtitle = soup.find('div', class_='subtitle')
    if subtitle:
        time_spans = subtitle.find_all('span', class_='cafeHoursDetails')
        for span in time_spans:
            if ':' in span.text:  # Check for meal time information
                meal_name, meal_time = span.text.split(':', 1)
                meal_name = meal_name.strip().upper()  # Normalize meal name
                meal_times[meal_name] = meal_time.strip()
            if ',' in span.text:  # Check for date (assumes a comma in the date string)
                menu_date = span.text.strip()

    meal_sections = soup.find_all('div', class_='meal-types')
    for section in meal_sections:
        meal_name_tag = section.find('div', class_='spacer day')
        if meal_name_tag:
            meal_name = meal_name_tag.text.strip()
            menu[meal_name] = {"time": meal_times.get(meal_name, "N/A"), "subsections": {}}

            subsections = section.find_all('div', class_='row')
            current_subsection_title = None
            for subsection in subsections:
                subsection_title_tag = subsection.find('div', class_='sub-section')
                if subsection_title_tag:
                    current_subsection_title = subsection_title_tag.text.strip()
                    if current_subsection_title not in menu[meal_name]["subsections"]:
                        menu[meal_name]["subsections"][current_subsection_title] = []

                if current_subsection_title:
                    items = subsection.find_all('div', class_='item')
                    for item in items:
                        item_text = item.find('p').get_text(" ", strip=True)
                        menu[meal_name]["subsections"][current_subsection_title].append(item_text)
    
    # Add the extracted date to the JSON
    menu["Date"] = menu_date
    

    # Save the menu to a JSON file
    json_file = 'menu_with_times.json'
    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(menu, file, indent=4)
    print(f"Menu extracted from HTML and saved to {json_file}")
