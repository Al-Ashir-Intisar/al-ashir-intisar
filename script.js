// Load CSV data and populate the menu
fetch('menu.csv')
  .then(response => response.text())
  .then(data => {
    const rows = data.split('\n').slice(1); // Skip header
    const menuData = rows.map(row => {
      const [meal, category, item] = row.split(',');
      return { meal, category, item };
    });

    populateMenu(menuData);
    createRatingOptions(menuData);
  });

function populateMenu(menuData) {
  const menuContainer = document.getElementById('menu-container');
  const meals = ['breakfast', 'lunch', 'dinner'];

  meals.forEach(meal => {
    const mealItems = menuData.filter(item => item.meal === meal);
    const mealDiv = document.createElement('div');
    mealDiv.classList.add('card');
    mealDiv.innerHTML = `<h3>${meal.toUpperCase()}</h3>`;
    mealItems.forEach(item => {
      mealDiv.innerHTML += `<p>${item.item}</p>`;
    });
    menuContainer.appendChild(mealDiv);
  });
}

function createRatingOptions(menuData) {
  const ratingContainer = document.getElementById('rating-container');
  const meals = [...new Set(menuData.map(item => item.meal))];

  meals.forEach(meal => {
    const ratingDiv = document.createElement('div');
    ratingDiv.classList.add('card');
    ratingDiv.innerHTML = `
      <h3>${meal.toUpperCase()}</h3>
      <label for="rating-${meal}">Rate (1-5): </label>
      <select id="rating-${meal}">
        <option value="" disabled selected>Select</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button onclick="submitRating('${meal}')">Submit</button>
    `;
    ratingContainer.appendChild(ratingDiv);
  });
}

// Replace these constants with your values
const API_KEY = "AIzaSyCzFiz84aaMQIl-AEUPdI8NC1mFtsCRPXc";
const SPREADSHEET_ID = "11Oks2e6aCiWezsOdhXyXoHccOheP80gottTouZ_LfIg"; // Replace with your Spreadsheet ID
const SHEET_NAME = "ratings"; // Replace with your sheet name (default: Sheet1)

function appendToSheet(meal, rating) {
  const timestamp = new Date().toISOString();
  const values = [[meal, rating, timestamp]];

  console.time("Append Time");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  })
    .then(response => response.json())
    .then(data => {
      console.timeEnd("Append Time");
      console.log("Data appended successfully:", data);
    })
    .catch(error => {
      console.timeEnd("Append Time");
      console.error("Error appending data:", error);
    });
}

// Example usage (call this function when submitting a rating)
function submitRating(meal) {
  const rating = document.getElementById(`rating-${meal}`).value;
  if (rating) {
    appendToSheet(meal, rating);
  } else {
    alert("Please select a rating.");
  }
}

