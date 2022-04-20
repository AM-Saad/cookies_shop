function productCard(c, type,) {

    $('main .content .items').append(`  
                <div class="content-item btn_hover_effect ">
                <div class="content-item_body">
                    <p>${c.name}</p>
                    <p>${c.info.sellingPrice}</p>
                    <p>${c.info.quantity}</p>
                    <p>${c.discount}</p>
                    <input type="hidden" name="itemId" value="${c._id}">
                </div>
                </div>
            </div>`)
}
function singleProduct(item) {

    $('.single-item').remove()
    $('#inventory-items').append(`
                <div class="single-item scaleable">
                <input type="hidden" name="itemId" value="${item._id}">
                <div class="inside-wrapper">
                    <div class="single-item_all_actions p-3 flex ">
                        <a class="edit-stock btn btn-alert single-item_actions">Edit</a>
                        <a class="deleteitem btn btn-danger single-item_actions">Delete</a>
                    </div>
                    <i class="fas fa-times  close close-single-item"></i>
                    <div class="single-item_basics flex f-space-evenly">
                        
                    </div>
                    <div class="grid g-two single-item_body">
                        <div class="single-item-core">
                            <div class="single-item_name"><h3>${item.name}</h3></div>
                            <div class="info"><p>Initial Quantity: <b>${item.info.initialQuanitity}</b> Item</p></div>
                            <div class="info"><p>Quantity In Stock: <b>${item.info.quantity}</b> Item</p></div>
                            <div class="info"><p>Cost Price: <b>${item.info.purchasingPrice}</b>$</p></div>
                            <div class="info"><p>Selling Price <b>${item.info.sellingPrice}<span class="c-g">$</span></b></p></div>
                            <div>
                                <div class="info"><p>Discount: <b>${item.discount || '0'} %</b></p></div>
                                <div class="info"><p>description: <b>${item.description}</b></p></div>
                            </div>
                        </div>
                        <div class="single-item_advanced">
                            <div class="item-units single-item_advanced_info ${item.attributes.length > 0 ? '' : 'none'}">
                                    <h3>Units</h3>
                            </div>
                            <div class="item-category single-item_advanced_info">
                                <h3>Category</h3>
                                <div class="bg-lightgray p-3">
                                    <p>Category: <b>${item.category.name}</b></p>
                                    <p class="${item.category.subCategory ? '' : 'none'}">Sub Category : <b>${item.category.subCategory}</b></p>
                                    <div class="categoryAttributes"></div>
                                    <div class="update-categories external-box none p-relative">
                                    <i class="close-change-category close fas fa-times"></i>
                                    <select class="changeItemCategory"></select>
                                    <a class="btn btn-success single-item_actions save-changed-category">تغيير</a>
                                    </div>
                                </div>
                            </div>
                            <div class="single-item_advanced_info m-3">
                                <div class="flex f-space-between">
                                    <h3>Images</h3>
                                    <i class="fas fa-plus get-new-images"></i>
                                </div>
                                <div class="images-perview p-relative item-images bg-lightgray"> </div>
                            </div>
                            
                            <div class="upload-new-images external-box none ">
                                <i class="fas fa-times get-new-images c-b close"></i>

                                <div class="form-group">
                                    <input type="file" name="updatedimages" class="item-inputs updatedimages" id="updatedimages" multiple/>
                                    <label for="updatedimages" class=""><span>select</span></label>
                                </div>
                                <h4>Images</h4>
                                <div class=" images-perview"></div>
                                <a class="btn btn-small upload-images single-item_actions btn-success">تغيير</a>
                            </div>

                        </div>
                    </div>
                    
                </div>
                    </div>
            `)
    if (item.images.length > 0) {
        item.images.forEach(image => {
            $('.images-perview.item-images').append(`
                    <div class="p-relative">
                        <i class="fas fa-trash delete-image single-item_actions close"></i>
                        <img src="${image}">
                    </div>
                `)
        })
    } else {
        $('.images-perview.item-images').append(`<span class="c-g">Add Images (Max 5)</span>`)
    }
    if (item.attributes.length > 0) {
        item.attributes.forEach(a => {
            $('.item-units').append(`
                    <div class="grid p-medium unit bg-lightgray m-3">
                        <input type="hidden" value="${item._id}" name="itemId">
                        <input type="hidden" value="${a._id}" name="attrId">
                        <span><b>${a.name}</b></span>
                        <ul class="flex f-start options p-relative" data-attrname=${a.name}>
                            
                        </ul>
                    </div>
                    `)
            a.options.forEach(o => $(`[data-attrname="${a.name}"]`).append(`<li data-attr="${o.name}" data-option="${o.name}" class="btn-small">${o.name}</li>`))
        })
    }

    $('.single-item').addClass('scale')

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

function categoriesettingsBox(categories) {
    $('.category-settings .item-setting_items').empty()
    removeFullBack($('.category-settings .item-setting_items'))
    if (categories.length > 0) {
        categories.forEach(g => {
            $('.category-settings .item-setting_items').append(`
        <div class=" item-setting_items_item btn-small" data-categoryname="${g.name.trim('')}">
            <input type="hidden" value="${g._id}" class="categoryId">
            <input type="hidden" value="${g.name}" class="categoryName">
            <i class="fas fa-ellipsis-v font-s sub-menu_btn"></i>
            <a class="flex f-space-between">
                    <h4 class="f-center"> ${g.name.replace(':', '')}</h4>
                <ul class="sub-menu">
                    <li>
                        <a class="p-3 c-g options-categories_item_addItem"><i class="fas fa-plus"></i></a>
                    </li>
                    <li class="get-confirmation">
                        <a class="p-3 c-r options-categories_item_delete-category "><i class="fas fa-trash"></i></a>
                    </li>
                </ul>
            </a>
            <ul class="category-attrs"></ul>
        </div>
    `)
            g.attributes.forEach(a => {
                $(`[data-categoryname="${g.name}"]`).find('.category-attrs').append(`
            <div class="${a.name}">
                <span>${a.name}</span>
                <div class="flex bg-lightgray f-space-around"></div>
            </div>
            `)
                a.options.forEach(o => {
                    $(`[data-categoryname="${g.name}"]`).find(`.${a.name} .flex`).append(`
                        <span>${o.name}</span>
                    `)
                })
            })
        })
    } else {
        addFullBack($('.category-settings .item-setting_items'))
    }
    $('.category-settings').removeClass('none')

}



function displayCategories(categories) {
    $('.options-categories_item:gt(0)').remove()
    $(".itemGroupResult option").remove()
    $(".itemGroupResult").append(`<option class="category-item" selected value="default">default</option>`)

    if (categories.length > 0) {
        categories.forEach(c => {
            $('.item-filters ul').append(`
            <li class="filter-shipments" data-filter="category" data-sku="${c.name}" data-val="${c.name}">
                <input type="hidden" value="${c._id}" class="categoryId">
                <a class="flex f-space-between">
                    <span> ${c.name} </span>
                </a>
                <ul class="category-options"></ul>
            </li>`)
            // <span class="showCategoryMenu">
            //             <i class="fas fa-caret-down i-bg bg-darkgray"></i>
            //         </span>
            // $('.categories li').eq(0).find(' i').addClass('none')
            c.attributes.forEach(a => {
                a.options.forEach(o => {
                    $(`[data-categoryname="${c.name}"]`).find('.category-options').append(`
                        <li data-category="${c.name}" data-option="${o.name}" class="getByOption btn-small">${o.name}</li>
                    `)
                })
            })

            $('.itemGroupResult').append(`<option class="category-item" value="${c.name}">${c.name}</option>`)
        })


    }
}


function unitSettingsBox(units) {
    $('.units-settings .item-setting_items').empty()
    units.forEach(u => {
        $('.units-settings .item-setting_items').append(`
        <div class="item-setting_items_item btn-small" data-unitname="${u.name}">
            <input type="hidden" value="${u._id}" class="unitId">
            <input type="hidden" value="${u.name}" class="unitName">
            <i class="fas fa-ellipsis-v font-s sub-menu_btn"></i>
            <a class="flex f-space-between">
                    <h4 class="f-center"> ${u.name}</h4>
                <ul class="sub-menu">
                    <li class="get-confirmation">
                        <a class="p-3 c-r item-setting_items_item_delete "><i class="fas fa-trash"></i></a>
                    </li>
                </ul>
            </a>
            <ul class="group-attrs">
            <div class="${u.name}">
                <span>${u.percentage}</span>
            </div>
            </ul>
        </div>
    `)

    })
    $('.units-settings').removeClass('none')
}



function confirmationbox(actionone, actiontwo, msg, name, type) {
    $('.confirmation-box').remove()
    $('body').append(`
    <div class="confirmation-box">
        <p>${msg}</p>
        <div class="flex f-space-between">
            <input type="hidden" class="name" value="${name}">
            <a class="btn btn-danger ${actionone}">Delete items</a>
            <a class="btn btn-info ${actiontwo}">Don't delete items</a>
            <a class="btn cancel-confirmation">Cancel</a>
        </div>
    </div>`
    )

    $('.cancel-confirmation').on('click', function (e) {
        $('.confirmation-box').remove()
        $('.external-box').removeClass('loader-effect')
    })
    $('.confirmation-box').addClass('block')


}




function newAttributeField(attributeLength) {
    $('.add-category-items_attrsbox').append(`
    <div class="attribute" data-attribute-number="${attributeLength}">
        <div>
            <label for="attributeName">Attribute Name</label>
            <input class="form-control" type="text" name="attributeName" class="attributeName" placeholder="e.g sizes">
        </div>
        <div>
            <label for="options">Options</label>
            <ul class="tags">
                <li>
                    <input class="currentInput form-control" type="text" placeholder="write then press enter">
                </li>
                <ul class="flex">
                </ul>
            </ul>
        </div>
        <i class="fas fa-trash remove-attr close i-bg i-bg-large bg-darkgray" style="left:10px; color:red"></i>
    </div>
    `)
}