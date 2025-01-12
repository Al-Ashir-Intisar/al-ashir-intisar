// Google API configuration
const CLIENT_ID = "965317836494-18jk5m5lhroud6so3uqe5e3gg9pbk5rg.apps.googleusercontent.com"; // Replace with your client ID
const SPREADSHEET_ID = "11Oks2e6aCiWezsOdhXyXoHccOheP80gottTouZ_LfIg"; // Replace with your Spreadsheet ID
const SHEET_NAME = "ratings";

let tokenClient;
let gapiInited = false;
let gisInited = false;
let userEmail = null; // To store the user's email address

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  });
  gapiInited = true;
  maybeEnableButtons();
  fetchRatings();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: "https://www.googleapis.com/auth/userinfo.email",
    callback: "", // Will be set dynamically
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    console.log("Google APIs are ready.");
  }
}

// Fetch user email after authentication
async function fetchUserEmail() {
  try {
    const response = await gapi.client.request({
      path: "https://www.googleapis.com/oauth2/v2/userinfo",
    });
    userEmail = response.result.email; // Store the user's email address
    console.log("User email fetched:", userEmail);
  } catch (error) {
    console.error("Error fetching user email:", error);
  }
}

// Append data to the Google Sheet
async function appendToSheet(meal, foodItem, rating) {
  
  const timestamp = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', // Time zone for Minnesota
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  }).format(new Date());
  
  console.log(timestamp);
  

  // Get the selected value from the suggestion dropdown
  const suggestionDropdown = document.getElementById("suggestion-dropdown");
  const selectedSuggestion = suggestionDropdown?.value || "No Suggestion"; // Default to "No Suggestion" if not selected

  // Include the suggestion as the sixth column
  const values = [[meal, foodItem, rating, timestamp, userEmail, selectedSuggestion]];

  try {
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: values,
      },
    });
    console.log("Data appended successfully:", response);
    alert(`Rating for ${foodItem} (${meal}) with suggestion "${selectedSuggestion}" submitted successfully!`);
  } catch (error) {
    console.error("Error appending data:", error);
    alert("Failed to submit rating. Please try again.");
  }
}


// Submit rating with meal, food item, rating, timestamp, and email
function submitRating(meal) {
  const foodItem = document.getElementById(`food-item-${meal}`).value;
  const rating = document.getElementById(`rating-${meal}`).value;

  if (!foodItem || !rating) {
    alert("Please select a food item and rating.");
    return;
  }

  // Request authorization if needed
  tokenClient.callback = async (resp) => {
    if (resp.error) {
      console.error(resp.error);
      alert("Authorization failed. Please try again.");
      return;
    }

    // Fetch the user's email and append the rating
    console.log("Authorization successful. Fetching user email...");
    await fetchUserEmail();
    console.log("Submitting rating...");
    await appendToSheet(meal, foodItem, rating);

      // Reloading the window
      window.location.reload();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.callback();
  }
}

// Load the libraries dynamically
function loadLibraries() {
  const gapiScript = document.createElement("script");
  gapiScript.src = "https://apis.google.com/js/api.js";
  gapiScript.onload = gapiLoaded;
  document.body.appendChild(gapiScript);

  const gisScript = document.createElement("script");
  gisScript.src = "https://accounts.google.com/gsi/client";
  gisScript.onload = gisLoaded;
  document.body.appendChild(gisScript);
}

loadLibraries();

// Fetch and populate menu using meal_data.json
fetch('https://storage.googleapis.com/menu-buckets/updated-repo/meal_data.json')
//fetch('meal_data.json')
  .then(response => response.json())
  .then(data => {
    populateMenu(data);
    createRatingOptions(data);
  });

function populateMenu(menuData) {
  const menuContainer = document.getElementById('menu-container');

  menuData.forEach(entry => {
    const mealDiv = document.createElement('div');
    mealDiv.classList.add('meal-section');

    const mealHeader = document.createElement('h3');
    mealHeader.innerText = entry.Meal.toUpperCase();

    const dropdown = document.createElement('select');
    dropdown.id = `food-item-${entry.Meal}`;
    dropdown.innerHTML = `<option value="" disabled selected>Select Food Item</option>`;

    const foodItems = entry.Food_Items.split(', ');
    foodItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.innerText = item;
      dropdown.appendChild(option);
    });

    mealDiv.appendChild(mealHeader);
    mealDiv.appendChild(dropdown);
    menuContainer.appendChild(mealDiv);
  });

  // Populate the dropdown menu with the suggestions
  const suggestions = ["Perfect", "Undercooked", "Overcooked/Burnt", "Dry", "No Flavor", "Too Salty", "Too Ssweet", "Too Spicy", "Too Greasy", "Not Fresh"];

  const suggestionDropdown = document.getElementById("suggestion-dropdown");

  // Dynamically populate the dropdown options
  suggestions.forEach(suggestion => {
    const option = document.createElement("option");
    option.value = suggestion;
    option.textContent = suggestion;
    suggestionDropdown.appendChild(option);
  });

}

function createRatingOptions(menuData) {
  const ratingContainer = document.getElementById('rating-container');

  menuData.forEach(entry => {
    const ratingDiv = document.createElement('div');
    ratingDiv.classList.add('card');

    ratingDiv.innerHTML = `
      <h3>${entry.Meal.toUpperCase()}</h3>
      <label for="rating-${entry.Meal}">Rate (1-5): </label>
      <select id="rating-${entry.Meal}">
        <option value="" disabled selected>Select Rating</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button onclick="submitRating('${entry.Meal}')">Submit</button>
    `;

    ratingContainer.appendChild(ratingDiv);
  });
}

async function fetchRatings() {
  const API_KEY = "AIzaSyAju6jQzyeYW3PBxnOOhaEpFktwiPQoh_E";
  const SHEET_ID = "11Oks2e6aCiWezsOdhXyXoHccOheP80gottTouZ_LfIg";

  // Define meal types and their corresponding sheet ranges
  const mealSheets = {
    BREAKFAST: "breakfast_today!G:G",
    BRUNCH: "brunch_today!G:G",
    LUNCH: "lunch_today!G:G",
    DINNER: "dinner_today!G:G",
  };

// Helper function to fetch data and update the meal header in the menu-container
async function fetchAndUpdateMealRating(meal, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Warning: Unable to fetch ratings for ${meal}. HTTP status: ${response.status}`);
      updateMealHeaderWithRating(meal, "No Ratings Yet");
      return; // Exit gracefully
    }

    const data = await response.json();

    if (data.values && data.values.length > 0) {
      const num_ratings = data.values.length;
      const rawValue = data.values[0][0]; // Access the first row and first column
      const ratingValue = parseFloat(rawValue).toFixed(2);
      console.log(`${meal} - Rating fetched:`, ratingValue);

      // Update header with the fetched rating
      updateMealHeaderWithRating(meal, `${num_ratings} Ratings => ${ratingValue}/5`);
    } else {
      console.warn(`Warning: No ratings data found for ${meal}.`);
      updateMealHeaderWithRating(meal, "No Ratings Yet");
    }
  } catch (error) {
    console.warn(`Warning: Error occurred while fetching ratings for ${meal}:`, error);
    updateMealHeaderWithRating(meal, "No Ratings Yet");
  }
}

/**
 * Helper function to update the meal header with the rating or default message.
 * @param {string} meal - The meal name (e.g., "BREAKFAST").
 * @param {string} ratingText - The text to display in the header (e.g., "Rating: 4.5/5" or "No Ratings Yet").
 */
function updateMealHeaderWithRating(meal, ratingText) {
  const menuContainer = document.getElementById("menu-container");

  // Find the corresponding mealDiv in the menu-container
  const mealDiv = Array.from(menuContainer.getElementsByClassName("meal-section"))
    .find(section => section.querySelector("h3")?.textContent.includes(meal));

  if (mealDiv) {
    const mealHeader = mealDiv.querySelector("h3");
    if (mealHeader) {
      mealHeader.textContent = `${meal.toUpperCase()}: ${ratingText}`;
    }
  } else {
    console.warn(`Warning: No meal section found for ${meal}.`);
  }
}



  // Loop through each meal type and fetch ratings
  for (const [meal, range] of Object.entries(mealSheets)) {
    await fetchAndUpdateMealRating(meal, range);
  }
}

