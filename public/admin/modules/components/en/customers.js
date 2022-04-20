function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
        <div class="content-item_body">
            <p>${c.name}</p>
            <p>${c.mobile}</p>
            <p>${c.orders.length}</p>
            <input type="hidden" name="itemId" value="${c._id}">
        </div>
    </div>
  `)
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="itemId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions">
                        <a class="btn bg-w single-item_actions edit-item">Edit</a>
                        <a class="btn bg-w single-item_actions customer-orders-box">Customer Orders</a>
                        <a class="btn btn-danger single-item_actions delete-item">Delete Customer </a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core">
                        <div class="info single-item_name"> <p>Customer Name: ${c.name}</p></div>
                        <div class="info"> <p>Address: ${c.address || 'Unknown'} </p></div>
                        <div class="info"><p>Mobile : ${c.mobile || 'Unknown'} </p></div>
                        <div class="info"><p>Email : ${c.email || 'Unknown'} </p></div>
                        <div class="info flex" ><p class="m-r-3"> Orders: ${c.orders.length} </p> <i class="fas fa-eye item-orders-box single-item_actions m-l-3"></i><div>
                    </div>
                    <div class="single-item-stock">
                    </div>
                </div>
            </div>
   `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.customer-orders .inside-wrapper .items').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
    <input type="hidden" value="${o.id}" name="orderId">
    <div class="flex f-space-around ">
    <div> ${o.date}</div>
    <div>  Order Number: ${o.serialNo}</div>
    <div>  Order Status: ${o.status.text}</div>
    <div>  Order Price: ${Math.floor(o.totalPrice)}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}