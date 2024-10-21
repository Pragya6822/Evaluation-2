let Products = [];
let Reviews = [];

// Get productId from URL params
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Fetch product and review data from data.json and localStorage
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    Products = data.Product;
    Reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    const product = Products.find((p) => p.id == productId);
    if (product) {
      displayProductDetails(product);
    } else {
      document.getElementById("product-details").innerHTML = "<p>Product not found.</p>";
    }
  })
  .catch((error) => {
    console.error("Error loading JSON:", error);
  });

// Display product details
function displayProductDetails(product) {
  const productDetails = document.getElementById("product-details");
  productDetails.innerHTML = `
  <div class="slider-container">${renderImages(product.images)}</div>
  <h2>${product.title}</h2>
  <p>${product.description}</p>
  <p>Price: $${product.price}</p>
  <p>Strike Price: $${product.strikePrice}</p>
  <p>Available Quantity: ${product.quantity}</p>
  <p>Category: ${product.category}</p>
  <p>Average Rating: ${calculateAverageRating(product.id)}</p>
  <h3>Customer Reviews:</h3>
  <div id="reviews-container">${renderReviews(product.id)}</div>
`;
  displayReviews(product.id);
}

// Handle review submission
const reviewForm = document.getElementById("review-form");
const reviewInput = document.getElementById("review-input");
const ratingInput = document.getElementById("rating-input");

reviewForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const reviewText = reviewInput.value.trim();
  const rating = parseInt(ratingInput.value);
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser) {
    alert("Please login to submit a review.");
    return;
  }

  // Validate input
  if (reviewText.length > 200) {
    alert("Review exceeds the character limit (200).");
    return;
  }
  if (rating < 1 || rating > 5) {
    alert("Please provide a rating between 1 and 5.");
    return;
  }

  const userId = loggedInUser.email;
  const productId = params.get("id");

  // Check if the user has already submitted a review for this product
  const existingReview = Reviews.find((review) => review.userId === userId && review.productId == productId);
  if (existingReview) {
    existingReview.text = reviewText;
    existingReview.rating = rating;
  } else {
    const newReview = { id: Date.now(), userId, productId, text: reviewText, rating };
    Reviews.push(newReview);
  }

  localStorage.setItem("reviews", JSON.stringify(Reviews));
  displayReviews(productId);

  // Clear input fields after submission
  reviewInput.value = "";
  ratingInput.value = "";
});

// Display reviews for the current product
function displayReviews(productId) {
  const reviewsContainer = document.getElementById("reviews-container");
  const productReviews = Reviews.filter((review) => review.productId == productId);

  if (productReviews.length === 0) {
    reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
  } else {
    let reviewsHTML = "<h3>Customer Reviews:</h3>";
    productReviews.forEach((review) => {
      reviewsHTML += `
        <div class="review">
          <p>Rating: ${review.rating}/5</p>
          <p>${review.text}</p>
        </div>
      `;
    });
    reviewsContainer.innerHTML = reviewsHTML;
  }

  displayAverageRating(productReviews);
}

// Display the average rating for the current product
function displayAverageRating(productReviews) {
  const totalRating = productReviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = productReviews.length > 0 ? (totalRating / productReviews.length).toFixed(2) : 0;

  const averageRatingElement = document.getElementById("average-rating");
  averageRatingElement.textContent = `Average Rating: ${averageRating} (${productReviews.length} reviews)`;
}

// Render images
function renderImages(images) {
  return images.map((image) => image ? `<img src="${image}" alt="Product Image" class="product-image" />` : "").join("");
}

// Data Persistence: Persist user data, reviews, and ratings in localStorage
function persistData() {
  const userData = {
    userId: localStorage.getItem("loggedInUser"),
    cart: JSON.parse(localStorage.getItem("cart")),
    reviews: JSON.parse(localStorage.getItem("reviews")),
  };
  localStorage.setItem("userData", JSON.stringify(userData));
}

// Call the persistData function when the window is unloaded
window.addEventListener("beforeunload", persistData);

// Trigger the reviews display on page load
document.addEventListener("DOMContentLoaded", () => {
  displayReviews(productId);
});
 