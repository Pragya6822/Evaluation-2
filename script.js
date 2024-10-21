let Products = [];
let Cart = [];

// Check if user is logged in on page load
window.onload = function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    window.location.href = "login.html";  // Redirect to login if no user session
  }

  // Fetch products from data.json once
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      Products = data.Product;
      renderProducts(Products);  // Display products on page load
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
    });
  
  // Load cart on page load
  renderCart();  
};

// Render product list
function renderProducts(products) {
  const productList = document.getElementById("product-container");
  productList.innerHTML = "";

  products.forEach((product, index) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    const productTitle = document.createElement('h2');
    productTitle.innerText = product.title;
    productTitle.onclick = () => {
        window.location.href = `productDetail.html?id=${product.id}`;
    };

    productCard.innerHTML = `
      <div class="slider-container">
        <div class="image-slider" id="slider-${index}">
          ${renderImages(product.images, index)}
        </div>
        <button class="prev-btn" onclick="prevSlide(${index})">Previous</button>
        <button class="next-btn" onclick="nextSlide(${index})">Next</button>
      </div>

      <p>${product.description}</p>
      <p>Product Price: $${product.price}</p>
      <p>Strike Price: $${product.strikePrice}</p>
      <p>Available Quantity: ${product.quantity}</p>
      <p>Category: ${product.category}</p>
      <p>Average Rating: ${calculateAverageRating(product.id)}</p>
      <button onclick="addToCart('${product.title}')">Add to Cart</button>
    `;
    productCard.insertBefore(productTitle, productCard.firstChild);
    productList.appendChild(productCard);
  });
}

// Function to render images with index for sliding
function renderImages(images, index) {
  return images.map((image, imgIndex) => {
    if (image) {
      return `<img src="${image}" class="product-image" data-index="${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'}" />`;
    }
    return "";
  }).join("");
}
// Image Slider functionality
function nextSlide(index) {
  const slides = document.querySelectorAll(`#slider-${index} .product-image`);
  const currentIndex = Array.from(slides).findIndex(slide => slide.style.display === 'block');
  slides[currentIndex].style.display = 'none';
  const nextIndex = (currentIndex + 1) % slides.length;
  slides[nextIndex].style.display = 'block';
}

function prevSlide(index) {
  const slides = document.querySelectorAll(`#slider-${index} .product-image`);
  const currentIndex = Array.from(slides).findIndex(slide => slide.style.display === 'block');
  slides[currentIndex].style.display = 'none';
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  slides[prevIndex].style.display = 'block';
}


// Search function
function SearchProducts() {
  const query = document.getElementById('search').value.toLowerCase();
  const filterProducts = Products.filter(product => product.title.toLowerCase().includes(query));

  if (filterProducts.length === 0) {
    document.getElementById("product-container").innerHTML = `<p>No Product found</p>`;
  } else {
    renderProducts(filterProducts);
  }
}

// Event listener for the Search button
document.getElementById('search-btn').addEventListener('click', SearchProducts);


// Sorting function
window.sortProducts = () => {
  const sortValue = document.getElementById("sort").value;
  let sortedProducts = [...Products];

  switch (sortValue) {
    case "az":
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "za":
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "priceLowHigh":
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case "priceHighLow":
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    default:
      break;
  }

  renderProducts(sortedProducts);
};

// Function to add product to the cart
function updateCartCounter() {
  const cartCounter = document.getElementById("cart-counter");
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  cartCounter.textContent = cartItems.length;
}

// Call this function after every cart change
window.addToCart = (title) => {
  const product = Products.find((p) => p.title === title);
  const existingItem = Cart.find((item) => item.title === title);

  if (product) {
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      product.quantity = 1;
      Cart.push(product);
    }
    localStorage.setItem("cart", JSON.stringify(Cart));
    alert(`${product.title} has been added to the cart.`);
    updateCartCounter();
    renderCart();

    // Show feedback message
    const message = document.createElement('div');
    message.className = 'feedback-message';
    message.innerText = `${product.title} added to cart!`;
    document.body.appendChild(message);

    // Remove the message after 2 seconds
    setTimeout(() => {
      message.remove();
    }, 2000);
  }
};

// Calculate average rating for a product
function calculateAverageRating(productId) {
  const Reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  const productReviews = Reviews.filter(review => review.productId == productId);
  if (productReviews.length === 0) return "No reviews";

  const totalRating = productReviews.reduce((acc, review) => acc + review.rating, 0);
  return (totalRating / productReviews.length).toFixed(2);
}

// Function to render the cart & cart persistence
window.renderCart = () => {
  const cartContainer = document.getElementById("cart-container");
  Cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";

  if (Cart.length === 0) {
    cartContainer.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  Cart.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>Price: $${item.price.toFixed(2)}</p>
      <p>Quantity: <button onclick="decreaseQuantity(${index})">-</button> ${item.quantity} <button onclick="increaseQuantity(${index})">+</button></p>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    cartContainer.appendChild(cartItem);
  });

  // Update total price and quantity after rendering the cart
  updateTotal();
};

// Increase item quantity
window.increaseQuantity = (index) => {
  Cart[index].quantity += 1;
  localStorage.setItem("cart", JSON.stringify(Cart));
  renderCart();
};

// Decrease item quantity or remove from cart if quantity is 0
window.decreaseQuantity = (index) => {
  if (Cart[index].quantity > 1) {
    Cart[index].quantity -= 1;
  } else {
    Cart.splice(index, 1);  // Remove item if quantity reaches 0
  }
  localStorage.setItem("cart", JSON.stringify(Cart));
  renderCart();
};

// Update total price and quantity
window.updateTotal = () => {
  const totalPrice = Cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalQuantity = Cart.reduce((acc, item) => acc + item.quantity, 0);
  document.getElementById("total").innerText = `Total: $${totalPrice.toFixed(2)} (${totalQuantity} items)`;
};

// Remove item from cart
window.removeFromCart = (index) => {
  Cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(Cart));
  renderCart();
  updateTotal();
};

window.toggleCart = () => {
  const cartPopup = document.getElementById("cart-popup");
  cartPopup.classList.toggle('active');
  if (cartPopup.style.display === "none" || cartPopup.style.display === "") {
    cartPopup.style.display = "block";
    renderCart();
  } else {
    cartPopup.style.display = "none";
  }
};

// Timed pricing with countdown
let countdownDuration = 300;  // 5 minutes countdown

function startCountdown(product) {
  const timer = setInterval(() => {
    countdownDuration--;
    if (countdownDuration <= 0) {
      product.price = product.strikePrice;
      clearInterval(timer);
      renderCart();
    }
  }, 1000);
}
