module.exports.createSales = (Sales, sales, company, isEmp, user, date, totalSalesPrice) => {
    let newSales;

    if (sales.isShipped) {
        newSales = new Sales({
            items: sales.items,
            description: sales.description,
            externalItem: sales.externalItem,
            totalPrice: (parseInt(sales.shippingInfo.price) + totalSalesPrice),
            forCompany: company._id,
            barcode: '',
            date: date,
            isShipped: sales.isShipped,
            customer: sales.customer,
            shippingInfo: {
                address: sales.shippingInfo.address,
                price: sales.shippingInfo.price,
                state: {
                    state: 'waiting',
                    note: sales.shippingInfo.state.note
                },
                deliveryDate: sales.shippingInfo.deliveryDate,

            },
            leadSource: sales.leadSource,
            
            creator: {
                name: user.name,
                id: user._id,
            },
        });

    } else {
        newSales = new Sales({

            items: sales.items,
            description: sales.description,
            externalItem: sales.externalItem,
            totalPrice: totalSalesPrice,
            forCompany: company._id,
            barcode: '',
            salesDate: date,
            isShipped: sales.isShipped,
            customer: sales.customer,
            shippingInfo: {},
            leadSource: sales.leadSource,
            creator: {
                name: user.name,
                id: user._id,
            },


        });
    }

    return newSales

};