function quickviewBox(product) {

    return `
      <div class="modal__content product">
    <input type="hidden" value=${product._id} name="itemId">
    <i class="modal__close far fa-times-circle"></i>

    <div class="modal__left">
      <img class="modal__img" src="${product.images[0]}" alt="">
    </div>

    <div class="modal__right">
      <div class="detail">
        <h2 class="detail__title">${product.name}</h2>
        <p class="detail__description">${product.description}</p>
        <p class="detail__price">${product.info.sellingPrice} EGP</p>
        ${product.attributes.length === 0 ? `<a class="btn block add-cart">Add To Cart</a>`:`<a href="/product-details/${product._id}" class="btn block">See Options</a>`}
        
      </div>
    </div>

  </div>
    `
}