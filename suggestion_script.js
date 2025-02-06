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

// Get the current date formatted as MM/DD/YYYY
const stringCurrentDay = new Date().toLocaleDateString("en-US", {
  timeZone: "America/Chicago",
});
console.log(stringCurrentDay);

function putDate(stringCurrentDay) {
  const dateBox = document.getElementById("date-box");
  console.log(stringCurrentDay);
  // Setting the formatted date in the date box
  dateBox.textContent = stringCurrentDay;
}

// Example usage
putDate(stringCurrentDay);

console.log("Current Day:", currentDay);

// Function to fetch data based on the selected time range
function fetchSuggestions(timeRange) {
  const dateRefs = getDateRefs(timeRange);

  const promises = dateRefs.map((date) =>
    firebase.database().ref(`foodRatings/${date}`).once("value")
  );

  Promise.all(promises)
    .then((snapshots) => {
      const data = snapshots
        .map((snapshot) => snapshot.val())
        .filter((dayData) => dayData); // Filter out null values

      if (data.length === 0) {
        displayNoData();
        return;
      }

      const combinedStats = data.reduce((acc, dayData) => {
        return mergeStats(acc, processSuggestions(dayData));
      }, {});

      renderSuggestions(combinedStats);
    })
    .catch((error) => {
      console.error("Error fetching suggestions:", error);
      document.getElementById(
        "stats-container"
      ).innerHTML = `<p>Error loading suggestions. Please try again.</p>`;
    });
}

// Helper function to get date references for the given range
function getDateRefs(range) {
  const now = new Date();
  const dates = [];

  if (range === "today") {
    dates.push(currentDay);
  } else {
    const days = range === "7days" ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      dates.push(
        date
          .toLocaleDateString("en-US", { timeZone: "America/Chicago" })
          .split("/")
          .map((part) => part.padStart(2, "0"))
          .reverse()
          .join("-")
      );
    }
  }

  return dates;
}

// Merge stats from multiple days
function mergeStats(stats1, stats2) {
  for (const meal in stats2) {
    if (!stats1[meal]) stats1[meal] = {};

    for (const foodItem in stats2[meal]) {
      if (!stats1[meal][foodItem])
        stats1[meal][foodItem] = { suggestions: {}, ratings: [] };

      // Merge suggestions
      for (const suggestion in stats2[meal][foodItem].suggestions) {
        stats1[meal][foodItem].suggestions[suggestion] =
          (stats1[meal][foodItem].suggestions[suggestion] || 0) +
          stats2[meal][foodItem].suggestions[suggestion];
      }

      // Merge ratings
      stats1[meal][foodItem].ratings.push(...stats2[meal][foodItem].ratings);
    }
  }
  return stats1;
}

// Process suggestions and count them for each food item
function processSuggestions(data) {
  const stats = {};

  Object.values(data).forEach((entry) => {
    const { Meal, FoodItem, Suggestion, Rating } = entry;
    const mealKey = Meal.toUpperCase(); // Convert Meal to uppercase

    if (!stats[mealKey]) {
      stats[mealKey] = {};
    }

    if (!stats[mealKey][FoodItem]) {
      stats[mealKey][FoodItem] = { suggestions: {}, ratings: [] };
    }

    // Count suggestions
    if (Suggestion) {
      stats[mealKey][FoodItem].suggestions[Suggestion] =
        (stats[mealKey][FoodItem].suggestions[Suggestion] || 0) + 1;
    }

    // Collect ratings
    if (Rating !== undefined) {
      stats[mealKey][FoodItem].ratings.push(Number(Rating));
    }
  });

  return stats;
}

// Render suggestions and counts into a table
function renderSuggestions(stats) {
  const container = document.getElementById("stats-container");
  container.innerHTML = ""; // Clear loading message

  for (const [meal, foodItems] of Object.entries(stats)) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
          <th>${meal}</th>
          <th>Suggestion</th>
          <th>Count</th>
          <th>Average Rating</th>
        </tr>
      `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Collect all rows in an array for sorting
    const rows = [];

    for (const [foodItem, data] of Object.entries(foodItems)) {
      const { suggestions, ratings } = data;

      // Calculate average rating
      const averageRating = ratings.length
        ? (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(2)
        : "N/A";

      for (const [suggestion, count] of Object.entries(suggestions)) {
        rows.push({
          foodItem,
          suggestion,
          count,
          averageRating,
        });
      }
    }

    // Sort rows by count in descending order
    rows.sort((a, b) => b.count - a.count);

    // Append sorted rows to the table
    rows.forEach(({ foodItem, suggestion, count, averageRating }) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${foodItem}</td>
          <td>${suggestion}</td>
          <td>${count}</td>
          <td>${averageRating}</td>
        `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }
}

// Display a message when no data is available
function displayNoData() {
  document.getElementById(
    "stats-container"
  ).innerHTML = `<p>No suggestions available for the selected time range...</p>`;
}

// Event listener for the dropdown menu
document.getElementById("time-range").addEventListener("change", (event) => {
  const selectedRange = event.target.value;
  fetchSuggestions(selectedRange);
});

// Fetch suggestions for "Today" on page load
window.onload = () => fetchSuggestions("today");
