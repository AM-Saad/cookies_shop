const slidePage = document.querySelector(".slide-page");
const nextToSecPage = document.querySelector(".next-2");

const prevToFirstPage = document.querySelector(".prev-1");
const nextToThirdPage = document.querySelector(".next-3");
const prevtoSecPage = document.querySelector(".prev-3");
const submitBtn = document.querySelector(".submit");
const progressText = document.querySelectorAll(".step p");
const progressCheck = document.querySelectorAll(".step .check");
const bullet = document.querySelectorAll(".step .bullet");
let current = 0;

nextToSecPage.addEventListener("click", function (event) {
    event.preventDefault();
    const valid = validateForm(event)
    if (valid) {
        slidePage.style.marginLeft = "-25%";
        // progressCheck[current].classList.add("active");
        // bullet[current + 1].classList.add("active");
        // progressText[current + 1].classList.add("active");
        current += 1;
    }

});

prevToFirstPage.addEventListener("click", function (event) {
    event.preventDefault();

    slidePage.style.marginLeft = "0%";
    bullet[current].classList.remove("active");
    progressCheck[current - 1].classList.remove("active");
    progressText[current].classList.remove("active");
    current -= 1;
});


nextToThirdPage.addEventListener("click", function (event) {
    event.preventDefault();
    const valid = validateForm(event)
    if (valid) {
        slidePage.style.marginLeft = "-50%";
        current += 1;
    }
});

prevtoSecPage.addEventListener("click", function (event) {
    event.preventDefault();
    slidePage.style.marginLeft = "-25%";
    progressCheck[current - 1].classList.remove("active");
    progressCheck[current].classList.remove("active");
    bullet[current].classList.remove("active");
    progressText[current].classList.remove("active");
    current -= 1;
});



submitBtn.addEventListener("click", function () {
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;

});







function validateForm(e) {
    // This function deals with validation of the form fields
    var x, y, i, valid = true;
    // x = document.getElementsByClassName("tab");
    // y = x[currentTab].getElementsByTagName("input");
    const inputs = $(e.target).parents('.page').find('input')
    // A loop that checks every input field in the current tab:
    inputs.each(function () {
        const val = $(this).val()
        // If a field is empty...
        if (val == "") {
            // add an "invalid" class to the field:
            $(this).addClass("invalid")
            // and set the current valid status to false:
            valid = false;
        } else {
            $(this).addClass("valid")
        }

    })

    // If the valid status is true, mark the step as finished and valid:
    if (valid) {
        bullet[current].classList.add("active");
        progressCheck[current].classList.add("active");

        progressText[current + 1].classList.add("active");
        bullet[current + 1].classList.add("active");
        // document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid; // return the valid status
}



var dtToday = new Date();

var month = dtToday.getMonth() + 1;
var day = dtToday.getDate() + 1
console.log(day)
console.log(month)
var year = dtToday.getFullYear();
if (month < 10) {
    month = '0' + month.toString();
}
if (day < 10) {
    day = '0' + day.toString();
}

var maxDate = year + '-' + month + '-' + day;
$('#delivery_date').attr('min', maxDate);
document.getElementById('delivery_date').value = maxDate