// When the page loads, fetch the list of areas from the Meal DB API, log them, and populate the dropdown
window.addEventListener("DOMContentLoaded", async function () {
  // The API endpoint for getting the list of areas
  const url = "https://www.themealdb.com/api/json/v1/1/list.php?a=list";
  const areaSelect = document.getElementById("area-select");
  // Start with a default option
  areaSelect.innerHTML = '<option value="">Select Area</option>';

  try {
    // Fetch data from the API
    const response = await fetch(url);
    // Convert the response to JSON
    const data = await response.json();
    // Log the list of areas to the console
    console.log("List of areas:", data.meals);
    // For each area, add an <option> to the dropdown
    if (data.meals) {
      data.meals.forEach((areaObj) => {
        // Create a new <option> element
        const option = document.createElement("option");
        // Set both the value and text to the area name
        option.value = areaObj.strArea;
        option.textContent = areaObj.strArea;
        // Add the option to the dropdown
        areaSelect.appendChild(option);
      });
    }
  } catch (error) {
    // Log any errors that happen during the fetch
    console.error("Error fetching areas:", error);
  }

  // Fetch and populate categories
  const categorySelect = document.getElementById("category-select");
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  try {
    // Fetch categories from the API
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
    );
    const data = await response.json();
    // Log the list of categories to the console
    console.log("List of categories:", data.meals);
    // For each category, add an <option> to the dropdown
    if (data.meals) {
      data.meals.forEach((catObj) => {
        const option = document.createElement("option");
        option.value = catObj.strCategory;
        option.textContent = catObj.strCategory;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
});

// Helper function to fetch and display meals based on both filters
async function fetchAndDisplayMeals() {
  const area = document.getElementById("area-select").value;
  const category = document.getElementById("category-select").value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  // If neither filter is selected, do nothing
  if (!area && !category) return;

  let meals = null;

  // If both filters are selected, fetch both and find intersection
  if (area && category) {
    // Fetch by area
    const areaRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
        area
      )}`
    );
    const areaData = await areaRes.json();
    // Fetch by category
    const catRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
        category
      )}`
    );
    const catData = await catRes.json();
    // Find intersection by idMeal
    if (areaData.meals && catData.meals) {
      const areaIds = new Set(areaData.meals.map((m) => m.idMeal));
      meals = catData.meals.filter((m) => areaIds.has(m.idMeal));
    } else {
      meals = [];
    }
    console.log(`Recipes for area ${area} and category ${category}:`, meals);
  } else if (area) {
    // Only area selected
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
        area
      )}`
    );
    const data = await res.json();
    meals = data.meals || [];
    console.log(`Recipes for area ${area}:`, meals);
  } else if (category) {
    // Only category selected
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
        category
      )}`
    );
    const data = await res.json();
    meals = data.meals || [];
    console.log(`Recipes for category ${category}:`, meals);
  }

  // Display the recipes on the page
  if (meals && meals.length > 0) {
    meals.forEach((meal) => {
      // Create the card container
      const mealDiv = document.createElement("div");
      mealDiv.className = "meal";

      // Create the inner wrapper for flipping
      const mealInner = document.createElement("div");
      mealInner.className = "meal-inner";

      // --- Front of the card ---
      const mealFront = document.createElement("div");
      mealFront.className = "meal-front";

      const title = document.createElement("h3");
      title.textContent = meal.strMeal;

      const img = document.createElement("img");
      img.src = meal.strMealThumb;
      img.alt = meal.strMeal;

      mealFront.appendChild(title);
      mealFront.appendChild(img);

      // --- Back of the card ---
      const mealBack = document.createElement("div");
      mealBack.className = "meal-back";
      mealBack.textContent = "Loading...";

      // Add front and back to inner wrapper
      mealInner.appendChild(mealFront);
      mealInner.appendChild(mealBack);
      mealDiv.appendChild(mealInner);
      resultsDiv.appendChild(mealDiv);

      // When a user clicks a recipe card, fetch detailed info and show a popup
      mealDiv.addEventListener("click", async function (event) {
        event.stopPropagation(); // Prevent bubbling
        const popup = document.getElementById("popup");
        const popupContent = document.getElementById("popup-content");
        popupContent.innerHTML = "Loading...";
        popup.style.display = "flex";
        const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
        try {
          const detailResponse = await fetch(detailUrl);
          const detailData = await detailResponse.json();
          const mealDetail = detailData.meals[0];
          // Log the detailed meal info to the console
          console.log(`Details for meal ${meal.strMeal}:`, mealDetail);
          // Show recipe info in the popup
          popupContent.innerHTML = `
                <button class="close-btn" title="Close">&times;</button>
                <h2>${mealDetail.strMeal}</h2>
                <img src="${mealDetail.strMealThumb}" alt="${
            mealDetail.strMeal
          }">
                <p><strong>Category:</strong> ${
                  mealDetail.strCategory || ""
                }</p>
                <p><strong>Area:</strong> ${mealDetail.strArea || ""}</p>
                <p><strong>Instructions:</strong><br>${
                  mealDetail.strInstructions || "No instructions."
                }</p>
              `;
          // Add close button event
          popupContent.querySelector(".close-btn").onclick = function () {
            popup.style.display = "none";
          };
        } catch (error) {
          popupContent.innerHTML = "<p>Error loading details.</p>";
          console.error("Error fetching meal details:", error);
        }
      });
    });
  } else {
    resultsDiv.textContent = "No meals found for this filter.";
  }
}

// Listen for changes on both dropdowns

document
  .getElementById("area-select")
  .addEventListener("change", fetchAndDisplayMeals);
document
  .getElementById("category-select")
  .addEventListener("change", fetchAndDisplayMeals);

// Close popup when clicking outside the content
window.addEventListener("click", function (e) {
  const popup = document.getElementById("popup");
  if (popup && e.target === popup) {
    popup.style.display = "none";
  }
});
