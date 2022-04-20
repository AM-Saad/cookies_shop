function createInvoiceClass(type, appendedElm, i) {

    $('#invoice').remove()
    if (type == 'purchasing') {
        $(appendedElm).append(`
        <div id="invoice">
        <i class="close close-invoice fas fa-times"></i>
        <div class="toolbar hidden-print">
            <div class="text-right">
                <button id="printInvoice" class="btn btn-info"><i class="fa fa-print"></i> Print</button>
                <button class="btn btn-info"><i class="fa fa-file-pdf-o"></i> Export as PDF</button>
            </div>
            <hr>
        </div>
        <div class="invoice overflow-auto">
            <div style="min-width: 600px">
                <main>
                    <div class="row contacts">
                        <div class="col invoice-to">
                            <div class="text-gray-light">INVOICE For:</div>
                            <h2 class="to">${i.supplier ? 'Mr/Mrs ' + i.supplier.name : '______________________'}</h2>
                            <div class="address"></div>
                            <div class="email"><a>${i.supplier ? 'Mobile: ' + i.supplier.mobile : '....'}</a></div>
                        </div>
                        <div class="col invoice-details">
                            <h1 class="invoice-id">PURCHASING INVOICE</h1>
                            <div class="date">Date of Invoice: ${i.createdAt}</div>
                        </div>
                    </div>
                    <table border="0" cellspacing="0" cellpadding="0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th class="text-left">DESCRIPTION</th>
                                <th class="text-right">COST</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="no">01</td>
                                <td class="text-left"><h3>
                                    <a target="_blank" href="https://www.youtubi.com/channel/UC_UMEcP_kF0z4E6KbxCpV1w">
                                    ${i.name}
                                    </a>
                                    </h3>
                                   
                                   ${i.info.description}
                                </td>
                                <td class="unit">$${i.info.purchasingPrice}</td>
                                <td class="qty">${i.info.initialQuanitity}</td>
                                <td class="total">$${(i.info.purchasingPrice * i.info.initialQuanitity)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">SUBTOTAL</td>
                                <td>$${(i.info.purchasingPrice * i.info.initialQuanitity)}</td>
                            </tr>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">TAX 0%</td>
                                <td>$0</td>
                            </tr>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">GRAND TOTAL</td>
                                <td>$${(i.info.purchasingPrice * i.info.initialQuanitity)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div class="thanks">Thank you!</div>
                    <div class="notices">
                        <div>NOTICE:</div>
                        <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                    </div>
                </main>
                <footer>
                    Invoice was created on a computer and is valid without the signature and seal.
                </footer>
            </div>
            <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
            <div></div>
        </div>
    </div>
        `)
    }
    if (type=='expenses') { 
        $(appendedElm).append(`
        <div id="invoice">
        <i class="close close-invoice fas fa-times"></i>

        <div class="toolbar hidden-print">
            <div class="text-right">
                <button id="printInvoice" class="btn btn-info"><i class="fa fa-print"></i> Print</button>
                <button class="btn btn-info"><i class="fa fa-file-pdf-o"></i> Export as PDF</button>
            </div>
            <hr>
        </div>
        <div class="invoice overflow-auto">
            <div style="min-width: 600px">
                <main>
                    <div class="row contacts">
                        <div class="col invoice-to">
                            <div class="text-gray-light">INVOICE For:</div>
                            <h2 class="to">${i.supplier ? 'Mr/Mrs ' + i.supplier.name : i.for}</h2>
                            <div class="address">${i.supplier ? 'Address: ' + i.supplier.address : '....'}</div>
                            <div class="email"><a>${i.supplier ? 'Mobile: ' + i.supplier.mobile : '....'}</a></div>
                        </div>
                        <div class="col invoice-details">
                            <h1 class="invoice-id">INVOICE ${i.serialNo}</h1>
                            <div class="date">Date of Invoice: ${i.date}</div>
                            <div class="date">Due Date: ${i.scheduled.state ? i.scheduled.date : '______________'}</div>
                        </div>
                    </div>
                    <table border="0" cellspacing="0" cellpadding="0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th class="text-left">DESCRIPTION</th>
                                <th class="text-right">COST</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="no">01</td>
                                <td class="text-left"><h3>
                                    <a target="_blank" href="https://www.youtube.com/channel/UC_UMEcP_kF0z4E6KbxCpV1w">
                                    ${i.for}
                                    </a>
                                    </h3>
                                   
                                   ${i.description}
                                </td>
                                <td class="unit">$${i.amount}</td>
                                <td class="qty">${i.quantity}</td>
                                <td class="total">$${i.total}</td>
                            </tr>
                           
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">SUBTOTAL</td>
                                <td>$${i.total}</td>
                            </tr>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">TAX 0%</td>
                                <td>$0</td>
                            </tr>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">GRAND TOTAL</td>
                                <td>$${i.total}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div class="thanks">Thank you!</div>
                    <div class="notices">
                        <div>NOTICE:</div>
                        <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                    </div>
                </main>
                <footer>
                    Invoice was created on a computer and is valid without the signature and seal.
                </footer>
            </div>
            <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
            <div></div>
        </div>
    </div>
        `)
    }
    if ('refund') { }
    if (type == 'sales') {

        $(appendedElm).append(`
            <div id="invoice">
            <i class="close close-invoice fas fa-times"></i>
            <div class="toolbar hidden-print">
                <div class="text-right">
                    <button id="printInvoice" class="btn btn-info"><i class="fa fa-print"></i> Print</button>
                    <button class="btn btn-info"><i class="fa fa-file-pdf-o"></i> Export PDF</button>
                </div>
                <hr>
            </div>
            <div class="invoice overflow-auto">
                <div style="min-width: 600px">
                    <main>
                        <div class="row customers">
                            <div class="col invoice-to">
                            
                            <div class="text-gray-light">INVOICE TO:</div>
                            <h2 class="to">Mr. ${i.customer ? i.customer.name : 'Default'}</h2>
                            ${i.isShipped ? `<div class="address">Address ${i.shippingInfo.address} </div> ` : 'Not Addedd'}
                            ${i.isShipped ? `<div class="address">Mobile ${i.shippingInfo.mobile}</div>` : 'Not Addedd'}
                            <div>
                            </div>

                            <div class="col invoice-details">
                                <h1 class="invoice-id">INVOICE ${i.serialNo}</h1>
                                <div class="date">Date of Invoice: ${i.salesDate}</div>
                                <div class="date">Due Date: ${i.isShipped ? i.shippingInfo.deliveryDate : '______________'}</div>
                            </div>
                        </div>
                        <table border="0" cellspacing="0" cellpadding="0">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th class="text-left">ITEM</th>
                                    <th class="text-right">PRICE</th>
                                    <th class="text-right">Qty</th>
                                    <th class="text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                               
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2"></td>
                                    <td colspan="2">SUBTOTAL</td>
                                    <td>$${i.totalPrice}</td>
                                </tr>
                                <tr>
                                    <td colspan="2"></td>
                                    <td colspan="2">TAX 0%</td>
                                    <td>$0</td>
                                </tr>
                                <tr>
                                    <td colspan="2"></td>
                                    <td colspan="2">GRAND TOTAL</td>
                                    <td>$${i.totalPrice}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <div class="thanks">Thank you!</div>
                        <div class="notices">
                            <div>NOTICE:</div>
                            <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                        </div>
                    </main>
                    <footer>
                        Invoice was created on a computer and is valid without the signature and seal.
                    </footer>
                </div>
                <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
                <div></div>
            </div>
        </div>
      `)
        i.items.forEach(p => {
            if (p.hasPeriodTime) {
                $('tbody').append(
                    `
                        <tr>
                        <td class="no">01</td>
                        <td class="text-left"><h3>
                            <a target="_blank" href="https://www.youtube.com/channel/UC_UMEcP_kF0z4E6KbxCpV1w">
                            ${p.plan.unit}
                            </a>
                            </h3>
                        </td>
                        <td class="unit">$${p.plan.price}$</td>
                        <td class="qty">1</td>
                        <td class="qty">${parseInt(p.plan.price, 10) * 1}</td>
                    </tr>
                        `
                )
                $('.invoice-details').append(`
                    <div class="date">Plan From: ${p.plan.periodTime.from} To: ${p.plan.periodTime.to}</div>
                    `)
            } else {
                $('tbody').append(
                    `
                        <tr>
                        <td class="no">01</td>
                        <td class="text-left"><h3>
                            <a target="_blank" href="https://www.youtube.com/channel/UC_UMEcP_kF0z4E6KbxCpV1w">
                            ${p.name}
                            </a>
                            </h3>
                        </td>
                        <td class="unit">$${p.price}$</td>
                        <td class="qty">${p.quantity}</td>
                        <td class="total">${parseInt(p.price, 10) * parseInt(p.quantity, 10)}</td>
                    </tr>
                        `
                )
            }
        })
        if (i.externalItem != null) {
            $('tbody').append(
                `
                    <tr>
                    <td class="no">01</td>
                    <td class="text-left"><h3>
                        <a target="_blank" href="https://www.youtube.com/channel/UC_UMEcP_kF0z4E6KbxCpV1w">
                        ${i.externalItem.name}
                        </a>
                        </h3>
                    </td>
                    <td class="unit">$${i.externalItem.price}$</td>
                    <td class="qty">${i.externalItem.quantity}</td>
                    <td class="total">${parseInt(i.externalItem.price, 10) * parseInt(i.externalItem.quantity, 10)}</td>
                </tr>
                    `
            )
        }
        if (i.isShipped) {
            $('.invoice-to').append(`
              
          `)
        }
    }
}