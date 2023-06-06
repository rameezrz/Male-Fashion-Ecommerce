  // Get the input elements
  const productPriceInput = document.getElementById('productPrice');
  const salePriceInput = document.getElementById('salePrice');

  // Add event listener for input change
  productPriceInput.addEventListener('input', validateSalePrice);
  salePriceInput.addEventListener('input', validateSalePrice);

  // Function to validate sale price
  function validateSalePrice() {
    const productPrice = parseFloat(productPriceInput.value);
    const salePrice = parseFloat(salePriceInput.value);

    if (salePrice > productPrice) { 
      salePriceInput.setCustomValidity('Sale price should be less than the product price.');
    } else {
      salePriceInput.setCustomValidity('');
    }
  }
