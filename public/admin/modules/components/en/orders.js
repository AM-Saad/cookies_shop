function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
    <div class="content-item_body">
        <p>${c.serialNo}</p>
        <p>${c.date}</p>
        <p>${c.order_info.billing_details.first_name}</p>
        <p>${c.totalPrice}</p>
        <p>${c.status.text}</p>
        <input type="hidden" name="itemId" value="${c._id}">
    </div>
    </div>
  `)
}


function createSingleItem(i, session) {
    $('.single-item').remove()

    const sales = i
    $('main').append(`
                <div class="single-item scaleable">
                <input type="hidden" name="itemId" value="${sales._id}">
                    <div class="inside-wrapper">
                        <div class="single-item_all_actions p-3 flex">
                            <i class="fas fa-times font-xl close close-single-item"></i>
                            <a class="btn bg-w single-item_actions open-form" data-form="statusForm">Change Status</a>
                            <a href="/admin/orders/edit/${sales._id}" class="btn bg-blue">Edit </a>

                           <a class="btn btn-danger single-item_actions delete-item">Delete Order <i class="fa fa-trash"></i></a>
                            </div>
                            <div class="single-item_info">
                                <div class="grid">
                                    <span>Order Number:${sales.serialNo}</span>
                                    <span>Order Status:${sales.status.text} </span>
                                </div>
                                <div class="grid">
                                    <span>Order Date:${sales.date} </span>
                                    <span>Delivery Date :${sales.order_info.delivery_date} </span>
                                </div>
                            </div>
                            <div class="single-item_customer">
                                <div class="grid g-two bg-lightgray p-medium">
                                    <div>
                                         <p>Mr/: <b>${sales.order_info.billing_details.first_name}</b></p>
                                         <p>Mobile: <b>${sales.order_info.billing_details.phone}</b></p>
                                    </div>
                                    <div>
                                    <p>Area: <b>${sales.order_info.shipping_details.area.name}</b></p>
                                    <p>Street: <b>${sales.order_info.shipping_details.street}</b></p>
                                    <p>Floor: <b>${sales.order_info.shipping_details.floor}</b></p>
                                    <p>Apartment: <b>${sales.order_info.shipping_details.apartment}</b></p>
                                    </div>
                                  </div>
                       
                            </div>
                            <div class="single-item-core grid m-t-3 m-b-3">
                                <div class=" single-item-core_cells">
                                    <p>Name</p>
                                    <p>Price/Item</p>
                                    <p>Quantity</p>
                                    <p>Total</p>
                                </div>
                            </div>
                            <div class="bg-lightgray p-medium">

                                <p class="p-medium  font-l"> Shipping Price:${Math.floor(sales.order_info.shipping_details.price)}</p>
                                <p class="p-medium bg-dark c-g font-xl">Grand Total:${Math.floor(sales.totalPrice)}</p>
                            </div>
                    

                        </div>
                </div>
           `)
    sales.items.forEach((i) => {
        $('.single-item-core').append(`
                <div class="item product-item p-relative p-medium ">
                  <i class="sub-menu_btn close fas fa-ellipsis-v"></i>
                  <ul class="sub-menu">
                  <li class="delete-item single-item_actions"><i class=" fas fa-sync"></i>Delete</li>
                  </ul>
                  
                    <input type="hidden" name="itemId" value="${sales._id}">
                    <input type="hidden" name="productId" value="${i.itemId}">
                    <input type="hidden" name="itemId" value="${i._id}">
                    <div class="">
                        <p>${i.name}${i.unit ? i.unit.name : ''}</p>
                        <p>EGP ${i.price}</p>
                        <p>${i.quantity}</p>
                        <p>EGP ${i.price * i.quantity}</p>
                    </div>
                </div>
                `)
    })

    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.shipment-shipments .inside-wrapper').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
    <input type="hidden" value="${o.id}" name="orderId">
    <div class="flex f-space-around ">
    <div> ${o.date}</div>
    <div>Order Number: ${o.shipmentNo}</div>
    <div> Status: ${o.status.en}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}

function renderFilter(types) {
    $('.options-filters').empty()
    types.forEach(t => $('.options-filters').append(`
        <div class="options-filters_tag" data-filter="${t.filterType}" data-sku="${t.filterSku}" data-val="${t.filterVal}">
            <i class="fas fa-times remove-filter"></i>
            <span>${t.filterSku}</span>
        </div>
    `))
}

function invoice(i) {

    $('body').append(`
    <div id="invoice">
    <i class="close close-invoice fas fa-times"></i>

    <div class="toolbar hidden-print">
        <div class="text-right flex">
            <button id="printInvoice" class="btn btn-info"><i class="fa fa-print"></i> Print</button>
            <button class="btn btn-info"><i class="fa fa-file-pdf-o"></i> Export as PDF</button>
        </div>
        <hr>
    </div>
    <div class="invoice overflow-auto">
        <div style="min-width: 600px">
            <main>
                <div class="row contacts">
                    <div class="col invoice-details">
                        <h1 class="invoice-id">INVOICE ${i.shipmentNo}</h1>
                        <div class="date">Date of Invoice: ${i.date}</div>
                        <div class="date">Due Date: ${i.delivery_date}</div>
                    </div>
                    <div class="col invoice-to">
                        <h2 class="to">Name: ${i.receiver.name}</h2>
                        <div class="address">Address: ${i.receiver.address}</div>
                        <div class="email">Phone Number: ${i.receiver.phone}</div>
                    </div>
               
                </div>
                <table border="0" cellspacing="0" cellpadding="0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="no"></td>
                            
                            <td class="unit">$${i.price}/ ${i.unit.name}</td>
                            <td class="qty">${i.quantity}</td>
                            <td class="total">$${i.price}</td>
                        </tr>
                       
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">SUBTOTAL</td>
                            <td>$${i.price}</td>
                        </tr>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">Shipping</td>
                            <td>${i.shipping_price}</td>
                        </tr>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">GRAND TOTAL</td>
                            <td>$${i.price + i.shipping_price}</td>
                        </tr>
                    </tfoot>
                </table>
                <div class="thanks">Thank you!</div>
                <div class="notices">
                    <div>NOTICE:</div>
                    <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                </div>
            </main>
      
        </div>
        <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
        <div></div>
    </div>
</div>
    `)
}