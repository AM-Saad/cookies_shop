/*jslint browser: true*/

/*global console, alert, $, jQuery*/




$(document).ready(function () {

  $(".sub-menu_button").on("click", function (e) {
    e.preventDefault()
    e.stopPropagation()

    $("#pop-up_menu").css({ opacity: "1" });
    $("#pop-up_menu").css({ right: "0" });

    setTimeout(function () {
      $("#pop-up_menu .inner").css({ transform: "scale(1)" });
    }, 500);
  });

  $("#pop-up_menu").click(function () {
    $("#pop-up_menu .inner").css({ transform: "scale(0)" });

    setTimeout(function () {
      $("#pop-up_menu").css({ right: "-100%" });

    }, 300);
  });

  $(".pop-up_menu_cls").on("click", () => {
    $("#pop-up_menu .inner").css({ transform: "scale(0)" });

    setTimeout(function () {
      $("#pop-up_menu").css({ opacity: "0" });
      $("#pop-up_menu").css({ right: "-100%" });

      console.log("closed");
    }, 300);
  });

  $("#pop-up_menu .inner").click(function (e) {
    e.stopPropagation();
  });

  $('.mobile-nav_list_item').on('click', function (e) {
    e.preventDefault()
    e.stopPropagation();

    $(e.target).find('.mobile-nav_nested').addClass('open-nested_menu')
  })
  $('.mobile-nav_nested_cls').on('click', function (e) {
    $('.mobile-nav_nested').removeClass('open-nested_menu')
  })

  $(window).scroll(function () {
    if ($(this).scrollTop() >= 30) { // this refers to window
      $('.top-bar').addClass('none')
      $('.main-nav__item img').addClass('small')
      $('.nav-wrapper').addClass('fixed')
    } else {
      $('.top-bar').removeClass('none')
      $('.main-nav__item img').removeClass('small')
      $('.nav-wrapper').removeClass('fixed')

    }
  });


  $('body').on('click', '.sub-menu_btn', openmenu)
  function openmenu(e) {
    e.stopPropagation()
    e.preventDefault()
    $('.sub-menu').not($(e.target).parent().find('.sub-menu')).removeClass('activeMenu')
    $(e.target).parent().find('.sub-menu').toggleClass('activeMenu')
    $('.wrapper').on('click', function () { $('.sub-menu').removeClass('activeMenu') })
  }


  $('.grid-layout').on('click', function (e) {
    $('.content').addClass('grid')
  })

  $('.bar-layout').on('click', function (e) {
    $('.content').removeClass('grid')

  })



  checkWindowSize()
  $(window).on('resize', checkWindowSize)

  function checkWindowSize() {
    const screenWidth = $(window).width()

    if (screenWidth < 1025) {
      $("#side-menu").addClass('slide-menu')
      setTimeout(() => { $("#side-menu").css({ opacity: 1 }) }, 300);

      $("#sideNavIcon").click(function (e) {
        e.stopPropagation();
        $("#side-menu").toggleClass('slide-menu');
        $("#side-menu").toggleClass('shadow');

        $('.wrapper').on('click', function () {
          $("#side-menu").addClass('slide-menu');
          $("#side-menu").removeClass('shadow');
          $('.wrapper').off('click')
        })
      });

    } else {

      $('#side-menu').css({ opacity: 1 })
      $("#side-menu").removeClass('slide-menu');
      $('.wrapper').removeClass('slide-menu_reverse')

      $("#sideNavIcon").click(function () {
        $("#side-menu").toggleClass('slide-menu');
        $("#side-menu").toggleClass('shadow');
        $('.wrapper').toggleClass('slide-menu_reverse')
      });

    }


  }



  $('.user-message .close').on('click', () => { $('.user-message').remove() })



});

