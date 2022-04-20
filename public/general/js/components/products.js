function item(product) {
    return ` <a href="/product-details/${product._id}" class="lax product-list_item product-item"
    data-lax-opacity="1000 .1, 450 1, 50 1, -110 .3" data-lax-anchor="self">
    <input type="hidden" name="itemId" value="${product._id}">
    <div class="product-list_item__image p-relative">
        <img class="first-img animated" src="${ product.details.images[0]}"
            alt="${ product.name}">
        <img class="second-img" src="${ product.details.images[1]}" alt="${product.name}">
    </div>
    <div class="product-list_item__content">
        <h3 class="product__title">${ product.name}</h3>
        <h3 class="product__price">$${ product.price}</h3>
        <p class="product__description">${ product.details.description}</p>
    </div>
    <div class="product-list_item__actions flex f-end m-3">

        <button class="btn">Add To Cart</button>
        <button class="btn"><i class="fas fa-heart"></i></button>
    </div>
</a>`
}