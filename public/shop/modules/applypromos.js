
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


            // this.$searchname = $('#search-name')
            // this.$sort = $('.sort')


        },
        bindEvents: function () {
         

        },

    
        closeQuickView: function (e) {
            console.log(e);
            $('.fancybox-container').remove()
        }

    }
    product.init()
})()

