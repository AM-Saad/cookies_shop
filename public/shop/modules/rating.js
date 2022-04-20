$(document).ready(function () {

    $("form#ratingForm").on('submit', rate);
    $("input:radio[name=rating]").on('change', visibleBtn);
    $("body").on('click', hiddenBtn);

    async function rate(e) {
        e.preventDefault(); // prevent the default click action from being performed
        e.stopPropagation(); // prevent the default click action from being performed

        if ($("#ratingForm :radio:checked").length == 0) {
            $('#feedback-status').html("nothing checked");
            return false;
        } else {
            const stars = $('input:radio[name=rating]:checked').val()
            const itemId = $('input[name=itemId]').val()
            const csrf = $("[name=_csrf]").val();

            const data = await fetchdata(csrf, `/shop/api/product/rate/${itemId}?stars=${stars}`, 'post', {}, false)
            if (data) {
                $('#feedback-status').html('Thank You For Your Feedback');
            }
        }
    }

    function visibleBtn() {
        $('#feedback-status').html('')
        $('.ratingBtn').removeClass('none')
    }
    function hiddenBtn() { $('.ratingBtn').addClass('none') }
});