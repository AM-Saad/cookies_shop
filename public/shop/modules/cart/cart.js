function cartComponent(items, csrfToken) {
    $('.cart__item').remove()
    $('.mini-cart-no-products').remove()

    if (items.length === 0) {
        $('.offcanvas-footer').addClass('none')
        return $('.offcanvas_content').append(`
        <div class="mini-cart-no-products">
            <h4>Your cart is empty. <br > Start adding cookies 🤤</h4>
            <p class="return-to-shop m-medium">
                <a class="btn btn-main" href="/shop">Return to shop</a>
            </p>
        </div>
        `)
    }
    $('.offcanvas-footer').removeClass('none')

    items.forEach(p => {
        $('.offcanvas_minicart .items').append(`

                <li class="cart__item cart-product_item grid g-two">
                <input type="hidden" name="itemId" class="price" value="${p._id}" disabled>

                <div class="cart__item_main">

                    <img src="${p.image}" class="h-100" alt="">
                
                </div>
                <div class="cart__item_info">
                    <div>
                        <h3>${ p.name}</h3>
                      
                    </div>
                    <div class="deleteitem">
                        <input type="hidden" value="${ p._id}" name="itemId">
                        <input type="hidden" name="_csrf" value="${ csrfToken}">
                        <a class=" delete-item">Remove <i class="m-l-3 fas fa-trash"></i></a>
                    </div>
                    <div id="quantity" class="flex">
                        <input type="hidden" name="_csrf" value="${csrfToken}">
                        <input type="hidden" id="itemId" name="itemId" value="${ p._id}">
                        <div class="quantity-input quantity">
                            <div class="quantity-nav">
                                <div class="quantity-button quantity-down" onClick="quantityDown(this)" >-</div>
                                <input type="number" min="1" class="update-quantity item-qty " name="quantity" step="1"
                                value="${p.quantity}" />
                                <div class="quantity-button quantity-up" onClick="quantityUp(this)">+</div> 
                            </div>
                        </div>
                    </div>


                    <span class="block m-b-3"><b>${p.attributes[0].name}: ${p.attributes[0].option}</b></span>
                    <span class="total block m-t-3"><b data-ot=${p.total}>EGP  ${p.total}</b></span>
              
                </div>
            </li>

    `)
    });

}

function promoBox(cart) {
    const noPromo = isEmptyPromo(cart.promo)
    $('#promo-box').empty()
    if (cart.items.length > 0) {

        $('#promo-box').append(`
        <div>
            <div class="head p-relative">
                <p>Do you have a discount coupon?</p>
                
                <div class="promo p-relative">
                    ${noPromo ? ` <i class="fas fa-trash c-r close i-bg" id="remove-promo"></i> ` : ''}
                    ${noPromo ? `<p class="c-g m-0">Promo Applied <b>${cart.promo.name}</b></p>` : ''}
                </div>
            </div>
            <div class="flex f-start form-control">
                <input class="form-control" type="text" name="" id="pc">
                <a id="apply" class="btn ">Apply</a>
            </div>
        </div>
    `)
    }

}