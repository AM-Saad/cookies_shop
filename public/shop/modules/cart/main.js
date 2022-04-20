

async function getCart() {
    let cart = getCartId()
    $('.offcanvas_aside.offcanvas_aside_right').addClass('active')

    const csrf = $("[name=_csrf]").val();
    $('.offcanvas_aside_content').addClass('loader-effect')
    const data = await fetchdata(csrf, `/shop/api/cart?cart=${cart}`, 'get', {}, false)

    if (data) {
        setCartId(data.json.cart.sessionId)
        cartComponent(data.json.cart.items, csrf)
        promoBox(data.json.cart)
        $('a.viewcart').attr('href', `/cart?cart=${data.json.cart.sessionId}`)
        $('a.check-out').attr('href', `/checkout?cart=${data.json.cart.sessionId}`)
    }

    $('.offcanvas_aside_content').removeClass('loader-effect')
    return grandtotal(data.json.cart)

}

async function addToCart(e) {

    let cart = getCartId()


    const csrf = $("[name=_csrf]").val();

    const itemId = $(e.target).parents('.product').find("[name=itemId]").val()

    const availability = $(e.target).parents('.product').find('.availability').data('availability')
    const quantity = $(e.target).parents('.product').find(".item-qty").val() || 1;

    if (availability === 0) {
        $('.add-cart').addClass('opacity-5')
        $('.add-cart').removeClass('add-cart')
        return showmessage('Sorry, This product is out of stock now', 'info', 'body')
    }
    if (quantity > availability) return showmessage('Quantity in NOT Enough!', 'info', 'body')

    const hasAttrs = $('[data-attrs]')
    let attributes = []
    if (hasAttrs.length > 0) {
        $('.attribute').each(function () {
            let attr = {
                name: $(this).data('attr'),
                option: $(this).find('.attribute-option.active').data('options').toString(),
                price: $(this).find('.attribute-option.active').data('price').toString()
            }
            attributes.push(attr)
        })

        //     const checkedunit = $(e.target).parents('.product').find('.attr-list .active a').data('value')
        //     if (!checkedunit) return showmessage('Please Choose the unit', 'info', 'body')

        //     const price = $(e.target).parents('.product').find('.attr-list .active a').data('price')
        //     unit = { name: checkedunit, price: parseInt(price, 10) }
    }
    
    $(e.currentTarget).find('.lds-hourglass').removeClass('none')
    $(e.currentTarget).find('span').addClass('none')
    const data = await fetchdata(csrf, `/shop/api/cart/${itemId}?cart=${cart}`, 'post', JSON.stringify({ attributes, quantity }), true)

    if (data) {
        cartComponent(data.json.cart.items, csrf)
        grandtotal(data.json.cart)
        setCartId(data.json.cart.sessionId)
        promoBox(data.json.cart)

        $('.offcanvas_aside.offcanvas_aside_right').addClass('active')

        $('a.check-out').attr('href', `/checkout?cart=${data.json.cart.sessionId}`)
        $(e.target).parents('.product').find('[data-availability]').attr('data-availability', availability - quantity)
        $(e.target).parents('.product').find('[data-availability]').html(`Availability:<span> ${(availability - quantity)}Items</span>`)
        localStorage.setItem('c_s', data.json.cart.sessionId)

    }
    $(e.currentTarget).find('.lds-hourglass').addClass('none')
    $(e.currentTarget).find('span').removeClass('none')

}

async function updateQuantity(e) {
    // get required elements
    let cart = getCartId()


    const itemId = $(e.target).parents('.cart-product_item').find("[name=itemId]").val();
    const newQuantity = $(e.target).parents('.cart-product_item').find(".update-quantity").val();
    const csrf = $(e.target).parents('.cart-product_item').find("[name=_csrf]").val();

    $('.offcanvas_aside_content').addClass('loader-effect')

    const data = await fetchdata(csrf, `/shop/api/cart/${itemId}?qun=${newQuantity}&&cart=${cart}`, 'put', {}, false)
    if (data != null) {
        showmessage('Updated', 'success', 'body')
        cartComponent(data.json.cart.items, csrf)
        grandtotal(data.json.cart)
        promoBox(data.json.cart)

    }

    $('.offcanvas_aside_content').removeClass('loader-effect')

};


// delete item from cart async
async function deleteCartItem(e) {

    let cart = getCartId()

    // get required elements
    const productId = $(e.target).parents('.cart-product_item').find("[name=itemId]").val()
    const csrf = $("[name=_csrf]").val();
    $('.offcanvas_aside_content').addClass('loader-effect')


    // post request to server for delete product
    const data = await fetchdata(csrf, `/shop/api/cart/${productId}?cart=${cart}`, 'DELETE', {}, false)

    if (data != null) {
        called = true;
        showmessage('Deleted', 'success', 'body')
        $(e.target).parents(".minicart-prd").fadeOut().remove();
        grandtotal(data.json.cart)
        cartComponent(data.json.cart.items, csrf)
        promoBox(data.json.cart)

    }

    return $('.offcanvas_aside_content').removeClass('loader-effect')


};






// $('.minicart-drop-total').on('click', function (e) {
//     e.stopPropagation()
// })

const closeCart = () => $('.offcanvas_aside.offcanvas_aside_right').removeClass('active')

$('.close-cart').on('click', closeCart)

$('.offcanvas_content').on('click', function (e) {
    // e.preventDefault()
})




function grandtotal(cart) {
    $('.minicart-drop-summa').remove()
    // let items = $('[data-ot]');
    let grand = 0;
    let totalitems = 0
    for (const i of cart.items) {
        totalitems += i.quantity
    
    }

 
    $('.grand-total').html(
        `Grand Total: <b>EGP ${cart.total}</b>`
    )

    $('.minicart-qty').html(totalitems)
    $('.checkout').attr('href', `/checkout?cart=${cart._id}`)
    $('.viewcart').attr('href', `/cart?cart=${cart._id}`)
}

function getCartId() {
    let cartId = localStorage.getItem('c_s')
    if (!cartId) {
        cartId = sessionStorage.getItem('c_s')
        if (!cartId) {
            cartId = getCookie('c_s')
        }
    }
    return cartId
}
function setCartId(cartId) {
    sessionStorage.setItem('c_s', cartId);
    localStorage.setItem('c_s', cartId);
    setCookie('c_s', cartId, 365)
}



function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}



const quantityUp = (btn) => {

    let input = $(btn).parents('.quantity').find('input[type="number"]')

    let max = input.attr('max');

    var oldValue = parseFloat(input.val());
    if (oldValue >= max) {
        var newVal = oldValue;
    } else {
        var newVal = oldValue + 1;
    }
    input.val(newVal);
    input.trigger("change");
    return
}


const quantityDown = (btn) => {
    let input = $(btn).parents('.quantity').find('input[type="number"]')
    let min = input.attr('min')

    var oldValue = parseFloat(input.val());
    if (oldValue <= min) {
        var newVal = oldValue;
    } else {
        var newVal = oldValue - 1;
    }
    input.val(newVal);
    input.trigger("change");
}


function isEmptyPromo(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return true;
    }

    return false;
}



async function applyPromo(e) {
    e.preventDefault()
    let cs = getCartId()
    const csrf = $("[name=_csrf]").val();

    const pc = $('#pc').val()
    $('#promo-box .head .promo').remove()
    if (!pc) return $('#pc').css({ borderColor: 'red' })
    if (pc) $('#pc').css({ borderColor: '#e2e2e2' })

    $('body').addClass('loader-effect')
    try {
        const res = await fetch(`/shop/api/cart/promo/${cs}`, {
            method: "Post",
            headers: {
                'X-CSRF-Token': csrf,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ promo: pc })
        })
        const json = await res.json()
        if (res.status == 200) {
            $('#promo-box .head').append(`
                <div class="promo">
                    <i class="fas fa-trash c-r close i-bg" id="remove-promo"></i>
                    <p class="c-g m-0">Promo Applied <b>${pc}</b></p>
                </div>
            
            `)
            $('h2.grand-total').html(`Grand Total: <b>EGP ${json.total}</b>`)

        }
        if (res.status == 401) {
            $('#promo-box .head').append(`<p class="c-g m-0">Promo Applied <b>${pc}</b></p>`)

            showmessage(json.message, 'warning', 'body')
        }
        if (res.status != 401 && res.status != 200) {
            $('#promo-box .head').append(`<p class="c-r m-0">Promo is Invalid <b>${pc}</b></p>`)
        }
        $('body').removeClass('loader-effect')

    } catch (error) {
        showmessage(error, 'warning', 'body')

        $('body').removeClass('loader-effect')
    }




}



async function removePromo(e) {
    e.preventDefault()
    let cs = getCartId()
    const csrf = $("[name=_csrf]").val();


    $('body').addClass('loader-effect')
    try {
        const res = await fetch(`/shop/api/cart/promo/${cs}`, {
            method: "Delete",
            headers: {
                'X-CSRF-Token': csrf,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const json = await res.json()
        console.log(json);

        if (res.status == 200) {
            $('#promo-box .head .promo').remove()
            $('h2.grand-total').html(`Grand Total: <b>EGP ${json.total}</b>`)

        }

        $('body').removeClass('loader-effect')

    } catch (error) {
        showmessage(error, 'warning', 'body')
        $('body').removeClass('loader-effect')

    }




}

$('body').on('click', '.minicart-drop-content .items', function (e) { return e.stopPropagation() })
$('body').on('click', '.minicart-link', getCart)
$('body').on('click', '.add-cart', addToCart)
$('body').on('click', '.delete-item', deleteCartItem)
$('body').on('change', '.update-quantity', updateQuantity)

$('body').on('click', '#apply', this.applyPromo.bind(this))
$('body').on('click', '#remove-promo', this.removePromo.bind(this))


function addCartSessionToCartBtn(){
    let cs = getCartId()
    $('.go-to-cart').attr('href' , `/cart?cart=${cs}`)
}
addCartSessionToCartBtn()