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
                        <a class="btn bg-w single-item_actions edit-item">تعديل</a>
                        <a class="btn bg-w single-item_actions customer-orders-box">طلبات العميل</a>
                        <a class="btn btn-danger single-item_actions delete-item">حذف العميل</a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core">
                        <div class="info single-item_name" > <p>اسم العميل: ${c.name}</p></div>
                        <div class="info"> <p>العنوان: ${c.address || 'غير معروف'} </p></div>
                        <div class="info"><p>الموبايل : ${c.mobile || 'غير معروف'} </p></div>
                        <div class="info"><p>الايميل : ${c.email || 'غير معروف'} </p></div>
                        <div class="info flex" ><p class="m-r-3">عدد الطلبات: ${c.orders.length} </p> <i class="fas fa-eye item-orders-box single-item_actions m-l-3"></i><div>
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
    <div> رقم الطلب: ${o.serialNo}</div>
    <div> حاله الطلب: ${o.status.text}</div>
    <div> سعر الطلب: ${Math.floor(o.totalPrice)}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}