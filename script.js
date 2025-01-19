// Your Firebase configuration
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

// Function to submit a rating
function submitRating(meal) {
  const foodItem = document.getElementById(`food-item-${meal}`).value;
  const rating = document.getElementById(`rating-${meal}`).value;

  if (!foodItem || !rating) {
    alert("Please select a food item and rating.");
    return;
  }

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });
  const suggestionDropdown = document.getElementById("suggestion-dropdown");
  const selectedSuggestion = suggestionDropdown?.value || "No Suggestion";

  const foodRating = {
    Meal: meal,
    FoodItem: foodItem,
    Rating: parseInt(rating),
    Timestamp: timestamp,
    Suggestion: selectedSuggestion,
  };

  // Store the rating in Firebase under the current date
  firebase
    .database()
    .ref(`foodRatings/${currentDay}`)
    .push(foodRating)
    .then(() => {
      console.log(`Rating for ${foodItem} (${meal}) submitted successfully!`);
      window.location.reload(); // Reload the page to refresh data
    })
    .catch((error) => {
      console.error("Error submitting food rating:", error);
      alert("Failed to submit rating. Please try again.");
    });
}

// Fetch ratings for the current day and calculate averages
function fetchRatings() {
  // Fetch data for the current date
  firebase
    .database()
    .ref(`foodRatings/${currentDay}`)
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // If no ratings exist, update the UI with "No Ratings Yet"
        updateMenuRatings({
          Breakfast: "No Ratings Yet",
          Brunch: "No Ratings Yet",
          Lunch: "No Ratings Yet",
          Dinner: "No Ratings Yet",
        });
        return;
      }

      // Organize ratings by meal type
      const mealRatings = { Breakfast: [], Brunch: [], Lunch: [], Dinner: [] };

      Object.values(data).forEach((entry) => {
        if (mealRatings[entry.Meal]) {
          mealRatings[entry.Meal].push(entry.Rating);
        }
      });

      // Calculate averages
      const averageRatings = {};
      for (const [meal, ratings] of Object.entries(mealRatings)) {
        if (ratings.length > 0) {
          const average =
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          averageRatings[meal] = `${ratings.length} Ratings: ${average.toFixed(
            2
          )}/5`;
        } else {
          averageRatings[meal] = "No Ratings Yet";
        }
      }

      // Update the menu with the calculated averages
      updateMenuRatings(averageRatings);
    })
    .catch((error) => {
      console.error("Error fetching today's ratings:", error);
      alert("An error occurred while fetching data.");
    });
}

// Update the menu headers with ratings
function updateMenuRatings(averageRatings) {
  const menuContainer = document.getElementById("menu-container");

  for (const [meal, ratingText] of Object.entries(averageRatings)) {
    const mealDiv = Array.from(
      menuContainer.getElementsByClassName("meal-section")
    ).find((section) =>
      section.querySelector("h3")?.textContent.includes(meal.toUpperCase())
    );

    if (mealDiv) {
      const mealHeader = mealDiv.querySelector("h3");
      if (mealHeader) {
        mealHeader.textContent = `${meal.toUpperCase()}: ${ratingText}`;
      }
    } else {
      console.warn(`Warning: No meal section found for ${meal}.`);
    }
  }
}

// Populate the menu dynamically
fetch("https://storage.googleapis.com/menu-buckets/updated-repo/meal_data.json")
  .then((response) => response.json())
  .then((data) => {
    populateMenu(data);
    createRatingOptions(data);
  });

function populateMenu(menuData) {
  const menuContainer = document.getElementById("menu-container");
  const dateBox = document.getElementById("date-box");
  console.log(menuData[0].Date);
  // Getting the date from email date
  dateBox.textContent = menuData[0].Date;

  menuData.forEach((entry) => {
    const mealDiv = document.createElement("div");
    mealDiv.classList.add("meal-section");

    const mealHeader = document.createElement("h3");
    mealHeader.innerText = entry.Meal.toUpperCase();

    const dropdown = document.createElement("select");
    dropdown.id = `food-item-${entry.Meal}`;
    dropdown.innerHTML = `<option value="" disabled selected>Select Food Item</option>`;

    const foodItems = entry.Food_Items.split(", ");
    foodItems.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.innerText = item;
      dropdown.appendChild(option);
    });

    mealDiv.appendChild(mealHeader);
    mealDiv.appendChild(dropdown);
    menuContainer.appendChild(mealDiv);
  });

  // Populate the dropdown menu with the suggestions
  const suggestions = [
    "Perfect",
    "Undercooked",
    "Overcooked/Burnt",
    "Dry",
    "No Flavor",
    "Too Salty",
    "Too Sweet",
    "Too Spicy",
    "Too Greasy",
    "Not Fresh",
  ];

  const suggestionDropdown = document.getElementById("suggestion-dropdown");

  suggestions.forEach((suggestion) => {
    const option = document.createElement("option");
    option.value = suggestion;
    option.textContent = suggestion;
    suggestionDropdown.appendChild(option);
  });
}

function createRatingOptions(menuData) {
  const ratingContainer = document.getElementById("rating-container");

  menuData.forEach((entry) => {
    const ratingDiv = document.createElement("div");
    ratingDiv.classList.add("card");

    ratingDiv.innerHTML = `
      <h3>${entry.Meal.toUpperCase()} (${entry.Time})</h3>
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

// Fetch ratings for the current day on page load
window.onload = fetchRatings;
