
/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/

(function () {
    const product = {
        //General information
        csrf: $('input[name="_csrf"]').val(),


        init: async function () {
            this.cashDom()

            this.bindEvents()

        },
        cashDom: function () {




        },
        bindEvents: function () {


            // $('.modal').on('click', this.closeQuickView.bind(this))


            $('.get-product').on('click', this.getProduct.bind(this))
            $('body').on('click', '.fancybox-close-small', this.closeQuickView.bind(this))
            $('body').on('click', '.modal__close', this.closeQuickView.bind(this))


        },

        getProduct: async function (e) {
            e.preventDefault()
            $('.modal-container').removeClass('none');
            const productId = $(e.target).parents('.product').find('input[name=itemId]').val()
            const data = await fetchdata(product.csrf, `/shop/api/product/${productId}`, 'get', true)
            if (data) {
                let product = data.json
                $('.modal-container').append(quickviewBox(product))
            }
            setTimeout(() => $('.modal__content ').addClass('modal__content--show'), 400);
        },
        closeQuickView: function (e) {
            $('.modal__content ').removeClass('modal__content--show')

            setTimeout(() => {
                $('.modal__content').remove();
                $('.modal-container').addClass('none');
            }, 400);


        }
    }
    product.init()
})()


