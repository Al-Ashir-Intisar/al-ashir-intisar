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

function submitRating(meal) {
  const rating = document.getElementById(`rating-${meal}`).value;
  if (rating) {
    alert(`Thank you for rating ${meal} with ${rating} stars!`);
  } else {
    alert('Please select a rating.');
  }
}
