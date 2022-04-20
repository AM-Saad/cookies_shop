$(document).ready(function () {
    $('.order').on('click', storeShipment)


    function storeShipment(e) {
        e.preventDefault()
        console.log(e);
        const siD = $(e.currentTarget).data('si')
        localStorage.setItem('si', siD)
        return window.location.href = e.currentTarget.href
    }
})
