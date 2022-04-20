function validateItem(i) {

    if (isEmptyOrSpaces(i.itemName)) {
        showmessage('Item Name/Code Must Be Added', 'info', 'body')
        return validate = false
    }
    if (!i.itemSellingPrice) {
        showmessage('Add Selling Price', 'info', 'body')
        return validate = false
    }
    // if (i.itemUnits.length == 0) {
    //     showmessage('Add atleast 1 UNIT', 'info', 'body')
    //     return validate = false
    // }

    if (!i.itemQuantity != '') {
        showmessage('Add Stock Quantity', 'info', 'body')
        return validate = false
    }


    return true

}


function validateAttrs(attrs) {
    if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name === '') {
                showmessage('اكتب اسم التصنيف', 'warning', 'body')
                return false
            }
            if (attrs[i].options.length == 0) {
                showmessage('اضف اختيار وحد علي الاقل لكل تصنيف', 'warning', 'body')
                return false
            }
        }
    }
    return true
}


function validateMultipleItems(items) {
    let validate = true
    for (let i = 0; i < items.length; i++) {
        if (isEmptyOrSpaces(items[i].itemName)) {
            showmessage('Item Name/Code Must Be Added', 'info', 'body')
            return validate = false
        }

        if (isEmptyOrSpaces(items[i].itemSellingPrice)) {
            showmessage('Add Selling Price', 'info', 'body')
            return validate = false
        }
        if (items[i].itemUnits.length == 0 || isEmptyOrSpaces(items[i].itemUnits)) {
            showmessage('Add atleast 1 UNIT', 'info', 'body')
            return validate = false
        }
        if (isEmptyOrSpaces(items[i].itemQuantity)) {
            showmessage('Add Stock Quantity', 'info', 'body')
            return validate = false

        }

    }

    return validate
}

function createItemForm(i) {

    var newform = new FormData()
    newform.append('name', i.itemName)
    newform.append('type', i.itemType)
    newform.append('units', JSON.stringify(i.itemUnits))
    newform.append('attributes', JSON.stringify(i.attributes))
    newform.append('category', JSON.stringify(i.itemCategory))
    newform.append('quantity', i.itemQuantity)
    newform.append('purchasingPrice', i.itemPurchasingPrice)
    newform.append('sellingPrice', i.itemSellingPrice)
    newform.append('supplier', i.supplierResult)
    newform.append('description', i.itemDescription)
    newform.append('barcode', i.barcode)
    newform.append('discount', i.discount)
    newform.append('popular', i.popular)
    newform.append('featured', i.featured)
    i.itemImg.forEach(img => newform.append('image', img))

    return newform
}




const isEmptyOrSpaces = (str) => {
    // return str === null || str.match(/^ *$/) !== null
    return str.replace(/\s/g, '').length === 0 ? true : false
}

const validateInput = (target) => {
    if (isEmptyOrSpaces(target.value)) {
        target.dataset.state = 'invalid'
        return false
    } else {
        target.dataset.state = 'valid'
        return true
    }
}



const insert = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index)
  ]