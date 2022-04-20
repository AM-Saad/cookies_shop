function createitemBox(c) {
    return `
    <div class="content-item btn_hover_effect ">
  
    <div class="content-item_body">
        <p>${c.serialNo}</p>
        <p>${c.date}</p>
        <p>${c.amount}</p>
        <p>${c.category}</p>
        <input type="hidden" name="itemId" value="${c._id}">
    </div>
    </div>
  `
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="itemId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions">
                    <a class="btn btn-info single-item_actions edit-item">تعديل</a>
                        <a class="btn btn-danger single-item_actions delete-item">حذف الفاتوره</a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core">
                        <div class="single-item_name">
                        <h3>المبلغ  : ${c.amount}</h3>
                        </div>
                        <div><p>رقم الفاتوره : ${c.serialNo || 'غير معروف'} </p></div>
                        <div><p>نوع الفاتوره : ${c.billType || 'غير معروف'} </p></div>
                       <div> <p>تاريخ الاصدار: ${c.date || 'غير معروف'} </p></div>
                       <div><p>تاريخ الاستحقاق : ${c.due || 'غير معروف'} </p></div>
                    </div>
                    <div class="single-item-stock">
                    </div>
                </div>
            </div>
   `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.drivers-shipments .inside-wrapper .items').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
    <input type="hidden" value="${o._id}" name="orderId">
    <div class="flex f-space-around ">
    <div> ${o.date}</div>
    <div> رقم الشحنه: ${o.shipmentNo}</div>
    <div> حاله الشحنه: ${o.status.text}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}