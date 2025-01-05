// Google API configuration
const CLIENT_ID = "965317836494-18jk5m5lhroud6so3uqe5e3gg9pbk5rg.apps.googleusercontent.com"; // From your credentials file
const SPREADSHEET_ID = "11Oks2e6aCiWezsOdhXyXoHccOheP80gottTouZ_LfIg";
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

// Append data to the sheet
async function appendToSheet(meal, rating) {
  const timestamp = new Date().toISOString();
  const values = [[meal, rating, timestamp, userEmail]]; // Add email as the fourth column

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
  } catch (error) {
    console.error("Error appending data:", error);
  }
}

// Submit rating with authorization
function submitRating(meal) {
  const rating = document.getElementById(`rating-${meal}`).value;

  if (!rating) {
    alert("Please select a rating.");
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
    await appendToSheet(meal, rating);
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    fetchUserEmail().then(() => appendToSheet(meal, rating));
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

// Populate menu and create rating options (unchanged logic)
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
