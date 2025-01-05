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
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email",
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
  const timestamp = new Date().toISOString();
  const values = [[meal, foodItem, rating, timestamp, userEmail]]; // Five columns

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
    alert(`Rating for ${foodItem} (${meal}) submitted successfully!`);
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
fetch('meal_data.json')
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
