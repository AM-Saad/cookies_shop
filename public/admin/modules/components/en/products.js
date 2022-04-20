function renderProducts(items, box) {
    $('.item').remove()
    if (items.length === 0) return $('.fallback').removeClass('none')
    $('.fallback').addClass('none')

    items.forEach(i => {
        box.append(
            `
                <div class="item btn grid ">
                <img src="${i.images[0] || '/images/product.png'}" class="w-50">
                <div class="flex f-space-around">
                <h5>${i.name}</h5>
                <h5>${i.info.sellingPrice}</h5>
                <span class="i-bg i-bg-large c-b p-2 font-xs">${i.info.quantity}</span>
                </div>
                    <input type="hidden" name="itemId" value="${i._id}">
                </div>
                `
        )
    })
}

function choosenProducts(items) {
    items.forEach(item => {
        if (item.hasPeriodTime) {
            $('#choosenitems').append(`
            <div class="choosenitem"  data-uid=${item.uid}>
                <input type="hidden" name="itemId" value="${item.itemId}" />
                 <h4>${item.name}</h4>
                 <span>Plan Price: <b>${item.price}</b></span>
                 <div>
                    <span>From: <b>${item.plan.periodTime.from}</b></span>
                    <span>To: <b>${item.plan.periodTime.to}</b></span>
                 </div>
                <i class="fas fa-trash removeChoosenitem"></i>
            </div>
            `)
        } else {
            $('#choosenitems').append(`
            <div class="choosenitem"  data-uid=${item.uid}>
                <input type="hidden" name="itemId" value="${item.id}" />
                <h4>${item.name}</h4>
                <span>Price/${item.price}</span>
                <span>qty: ${item.quantity}</span>
                <i class="fas fa-trash removeChoosenitem"></i>
            </div>
    `)
        }
    })
}