function ordersReport(orders) {

    let totalSolditems = 0
    let totalIncome = 0
    let totalItemsprices = 0
    $('.orders-reports .report-head').append(`
        <span>رقم الطلب</span>
        <span>التاريخ</span>
        <span>المنتجات</span>
        <span>المجموع</span>
    `)
    orders.forEach(i => {
        $('.orders-reports .report-body').append(`
        <div class="  bg-lightgray">
                <span>${i.orderNo}</span>
                <span>${i.date}</span>
                <span>${i.items}</span>
                <span>$${i.total}</span>
            </div>
        `)
        totalSolditems += i.items
        totalIncome += Math.floor(i.total)
    })

    $('.report-footer').append(`
    <span><b>المجموع</b></span>
    <span></span>
    <span>عدد العناصر المباعه: <b>${totalSolditems}</b> عنصر</span>
    <span>الأيرادات: <b>${totalIncome}</b> جنيه</span>
`)
}

function ordersItemsReport(items) {

    let totalSolditems = 0
    let totalIncome = 0
    let totalItemsprices = 0
    $('.orders-reports .report-head').append(`
        <span>اسم الصنف</span>
        <span>كميه الصنف</span>
        <span>سعر الصنف</span>
        <span>المجموع</span>
    `)
    items.forEach(i => {
        $('.orders-reports .report-body').append(`
            <div class=" bg-lightgray">
                <span>${i.unit ? i.name + ' / ' + i.unit : i.name}</span>
                <span>${i.quantity}</span>
                <span>${i.price}</span>
                <span>${(i.quantity * i.price)}</span>
            </div>
        `)
        totalSolditems += i.quantity
        totalIncome += (i.quantity * Math.floor(i.price))
        totalItemsprices += Math.floor(i.price)
    })

    $('.report-footer').append(`
        <span><b>المجموع</b></span>
        <span>${totalSolditems}</span>
        <span>${totalItemsprices}</span>
        <span>${totalIncome}</span>
    `)
}


function customersOrdersReport(items) {

    items.forEach(i => {
        $('.report-body').append(`
            <div class=" bg-lightgray">
            <span>${i.name}</span>
            <span>${i.items}</span>
            <span>${i.total}</span>
            </div>
        `)

    })

    $('.report-head').append(`
    <span>اسم العميل</span>
    <span>عدد المنتجات</span>
    <span>المجموع</span>
`)
}

function inventoryReport(items) {

    items.forEach(i => {
        $('.report-body').append(`
            <div class=" bg-lightgray">
            <span>${i.name}</span>
            <span>${i.info.quantity}</span>
            <span>${i.info.sellingPrice}</span>
            </div>
        `)

    })

    $('.report-head').append(`
    <span>اسم المنتج</span>
    <span>الكميه </span>
    <span>السعر</span>
`)
}