
$(document).ready(function () {

    $(".best-seller").slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        centerPadding: "60px",
        arrows: true,
        adaptiveHeight: true
    });


    // Subscribe PopUp
    function popUpSubscribtion() {
        $(".pop-up").fadeIn(300);
    }

    // setTimeout(popUpSubscribtion, 50000);

    $(".pop-up").click(function () {
        $(this).fadeOut();
    });

    $(".pop-up .inner").click(function (e) {
        e.stopPropagation();
    });

    $(".pop-up .cls").click(function (e) {
        e.preventDefault();
        $(".pop-up").fadeOut();
    });

    
    var images = [
        "/images/background.jpg",
        "/images/store.jpg",
    ];
    var index = 0;
    var myImage = $("#banner-img");
    var i = 0;
    setInterval(function () {
        myImage.fadeOut(700, function () {
            $(this).attr('src', `${images[index = (index + 1) % images.length]}`)
            myImage.fadeIn(1000)
        })
    }, 5000);

})