// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUxGxY3NHz435sRnm-2WN4VMyJMYsf0S",
  authDomain: "shouldigo-6237b.firebaseapp.com",
  databaseURL: "https://shouldigo-6237b-default-rtdb.firebaseio.com",
  projectId: "shouldigo-6237b",
  storageBucket: "shouldigo-6237b.appspot.com",
  messagingSenderId: "372060386218",
  appId: "1:372060386218:web:04cef54a7ee8356c6af1d",
  measurementId: "G-RR3QJKC7D",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database
const database = firebase.database();

console.log("Firebase Initialized!");

// Automatically capture today's date in US Central Time in YYYY-MM-DD format
const currentDay = new Date()
  .toLocaleString("en-US", { timeZone: "America/Chicago" })
  .split(",")[0]
  .split("/")
  .map((part) => part.padStart(2, "0"))
  .reverse()
  .join("-");

// Fetch suggestions for the current day and process them
function fetchSuggestionsForToday() {
  firebase
    .database()
    .ref(`foodRatings/${currentDay}`)
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        displayNoData();
        return;
      }

      // Process suggestions
      const suggestionStats = processSuggestions(data);

      // Render suggestions
      renderSuggestions(suggestionStats);
    })
    .catch((error) => {
      console.error("Error fetching suggestions:", error);
      document.getElementById(
        "stats-container"
      ).innerHTML = `<p>Error loading suggestions. Please try again.</p>`;
    });
}

// Process suggestions and count them for each food item
function processSuggestions(data) {
  const stats = {};

  Object.values(data).forEach((entry) => {
    const { Meal, FoodItem, Suggestion } = entry;

    if (!stats[Meal]) {
      stats[Meal] = {};
    }

    if (!stats[Meal][FoodItem]) {
      stats[Meal][FoodItem] = {};
    }

    if (Suggestion) {
      stats[Meal][FoodItem][Suggestion] =
        (stats[Meal][FoodItem][Suggestion] || 0) + 1;
    }
  });

  return stats;
}

// Render suggestions and counts into a table
function renderSuggestions(stats) {
  const container = document.getElementById("stats-container");
  container.innerHTML = ""; // Clear loading message

  for (const [meal, foodItems] of Object.entries(stats)) {
    const mealTitle = document.createElement("h2");
    mealTitle.textContent = `${meal}`;
    container.appendChild(mealTitle);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
          <th>Food Item</th>
          <th>Suggestion</th>
          <th>Count</th>
        </tr>
      `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const [foodItem, suggestions] of Object.entries(foodItems)) {
      for (const [suggestion, count] of Object.entries(suggestions)) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${foodItem}</td>
            <td>${suggestion}</td>
            <td>${count}</td>
          `;
        tbody.appendChild(row);
      }
    }

    table.appendChild(tbody);
    container.appendChild(table);
  }
}

// Display a message when no data is available
function displayNoData() {
  document.getElementById(
    "stats-container"
  ).innerHTML = `<p>No suggestions available for today.</p>`;
}

// Fetch suggestions on page load
window.onload = fetchSuggestionsForToday;
