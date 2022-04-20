function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
        <div class="content-item_body">
            <p>${c.name}</p>
            <p>${c.active ? "Active" : 'Inactive'}</p>
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
                        <a class="btn btn-danger single-item_actions delete-item">Delete </a>
                    </div>
                    <div class="single-item-core">
                     
                        <div class="info single-item_name"> <h3> Category Name: ${c.name}</h3> </div>
                        <div class="info"><p>Status: ${c.active ? "Active" : 'Inactive'}</p></div>
                        <div class="sub-category ${c.subCategory.length > 0 ? '' : 'none'}">
                            <h4>Sub Category</h4>
                            <ol class="items flex m-large"></ol>
                        </div>
                        </div>
                        <div class="images-perview p-relative item-images bg-lightgray"> 
                        <div class="p-relative">
                            <img src="/${c.image}">
                        </div>
                    </div>
                    </div>

                </div>
            </div>
    `)
    c.subCategory.forEach(s => $('.sub-category .items').append(`<li class="m-large p-large"><p>${s}</p></li>`))
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.customer-shipments .inside-wrapper').append(`
    < div class="p-medium m-b-3 order bg-lightgray border-1-g" style = "cursor:pointer" >
        <input type="hidden" value="${o.id}" name="orderId">
            <div class="flex f-space-around ">
                <div> ${o.date}</div>
                <div> رقم الشحنه: ${o.shipmentNo}</div>
                <div> حاله الشحنه: ${o.status.text}</div>
            </div>
            <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}