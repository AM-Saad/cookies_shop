// /*jslint browser: true*/

// /*global console, alert, $, jQuery*/



// let deferredPrompt;
// var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');


// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker
//         .register("../../sw.js")
//         .then(reg => {
//             console.log('service worker registered');

//         })
//         .catch(err => {
//             console.log("Server Worker Not registered", err);
//         });

//     // Add Home Screen Button
//     let btn = $('.install-btn');
//     window.addEventListener('beforeinstallprompt', e => {
//         console.log('ready to install..');
//         e.preventDefault();
//         deferredPrompt = e;
//         $('.install-btn').removeClass('none');
//     })

//     btn.on('click', e => {
//         deferredPrompt.prompt()
//         deferredPrompt.userChoice.then(choiceResult => {
//             $('.install-btn').addClass('none');

//             if (choiceResult === 'accepted') {

//             }
//         })
//     })

//     if (window.matchMedia('(display-mode: standalone)').matches) {
//         // do things here  
//         // set a variable to be used when calling something  
//         // e.g. call Google Analytics to track standalone use
//         $('.install-btn').addClass('none');

//     }

// }


var images = [
  "/shop/images/main.jpg",
  "/shop/images/main-open-min.jpg",
  "/shop/images/val_closed.jpg",
  "/shop/images/about.jpg",
];
var index = 0;
var myImage = $("header .hero");
var i = 0;
setInterval(function () {
  myImage.fadeOut(700, function () {
    $(this).attr('src', `${images[index = (index + 1) % images.length]}`)
    myImage.fadeIn(1000)
  })
}, 5000);

function showpasswordinput(e) {
  console.log($('#password').parent('div'));
  if ($(".password-form").hasClass('none')) {
    return $(".password-form").removeClass('none')
  }
  $(".password-form").addClass('none')
}


$(document).ready(function () {

  $(".sub-menu_button").on("click", function (e) {
    e.preventDefault()
    e.stopPropagation()

    $("#pop-up_menu").css({ opacity: "1" });
    $("#pop-up_menu").css({ left: "0" });

    setTimeout(function () {
      $("#pop-up_menu .inner").css({ transform: "translateX(0%)" });
    }, 100);
  });


  $("#pop-up_menu").click(function () {
    $("#pop-up_menu .inner").css({ transform: "translateX(-100%)" });

    setTimeout(function () {
      $("#pop-up_menu").css({ left: "-100%" });
    }, 100);
  });

  $(".pop-up_menu_cls").on("click", () => {
    $("#pop-up_menu .inner").css({ transform: "translateX(-100%)" });

    setTimeout(function () {
      $("#pop-up_menu").css({ opacity: "0" });
      $("#pop-up_menu").css({ left: "-100%" });
    }, 100);
  });

  $("#pop-up_menu .inner").click(function (e) {
    e.stopPropagation();
  });


  $('.mobile-nav_list_item').on('click', function (e) {
    e.stopPropagation()
    const nestedList = $(e.target).parents('.mobile-nav_list_item').find('.mobile-nav_nested')

    if (nestedList.length > 0) {
      e.preventDefault()
      nestedList.addClass('opened')
      $('.mobile-nav_nested_cls').removeClass('none')
    }
  })

  $('.mobile-nav_nested_cls').on('click', function (e) {
    $('.mobile-nav_nested_cls').addClass('none')

    $('.mobile-nav_nested').removeClass('opened')
  })
  // product images Slider

  $('.mobile-nav_nested').on('click', function (e) {
    e.stopPropagation()

  })

  $('.main-nav__item.account').on('click', function (e) {
   const link =  $(e.currentTarget).find('a')[0]
   console.log(link);
  })

  setTimeout(function () { $('#head-part .fly-in-text li').removeClass('hiddeen'); }, 800);



  function checkAttrOptins(e) {
    $(e.currentTarget).parents('.attribute').find('.unit-input').removeClass('active')
    $(e.currentTarget).addClass('active')
    calcProductWithAttrsPrice()
  }




  $(window).scroll(function () {
    if ($(this).scrollTop() >= 10) { // this refers to window
      $('.top-bar').addClass('none')
      $('.main-nav__item img').addClass('small')
      $('.nav-wrapper').addClass('fixed')
    } else {
      $('.top-bar').removeClass('none')
      $('.main-nav__item img').removeClass('small')
      $('.nav-wrapper').removeClass('fixed')

    }
  });


  function toggleForms(e) {
    $(`.forms .form`).addClass('none')
    $(`.${$(e.target).data('form')}`).removeClass('none')
    $(`.forms .actions .btn`).removeClass('active')
    $(e.target).addClass('active')


  }




  $('body').on('click', '.unit-input', checkAttrOptins)
  // $('body').on('click','#newaccount', showpasswordinput)

  $('.forms .actions span').on('click', toggleForms)


});

function calcProductWithAttrsPrice() {
  let total = 0
  const itemPrice = $('.section.product').data('p-p')
  total += itemPrice
  $('.unit-input.active').each(function () {
    total += $(this).data('price')
  })
  $('.product-price').html(`EGP ${total}`)
}
