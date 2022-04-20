
/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/
(function () {
    const state = {
        jwt: $('input[name="_csrf"]').val(),
        state: null,

        allCategories: [],
        companyitems: [],
        filters: { types: [], items: [] },
        //Item informations
        creating: false,
        itemType: 'consumable',
        itemName: '',
        itemCategory: { name: 'default', attributes: [], subCategory: null },
        barcode: null,
        itemUnits: [],
        itemOptions: [],
        onSetOption: null,
        itemQuantity: 1,
        itemSellingPrice: null,
        itemPurchasingPrice: null,
        itemDescription: '',
        itemImages: [],
        attributes: [],
        discount: 0,
        featured: false,
        popular: false,
        supplierState: false,
        supplierResult: null,
        progressprecentage: {},
        editing: false,
        editingItem: null,
        init: async function () {
            console.log(state);
            await this.getItems()
            this.cashDom()
            await this.getCategory()
            this.addDynamicEvents()
            this.precentage()
            // this.detectScanner()
            return this.bindEvents()

        },
        cashDom: function () {
            this.itemTypeBtn = document.getElementById('itemType')
            this.$searchname = $('#search-name')

            this.$itemName = $('input[name="itemName"]')
            this.$itemDesc = $('#itemDesc')
            this.$itemDiscount = $('#itemDiscount')
            this.$itemfeatured = $('#featured')
            this.$itempopular = $('#popular')
            this.quantity = document.getElementById('quantity')
            this.sellingPriceResult = document.getElementById('sellingPriceResult')
            this.itemUnit = document.getElementById('itemMainUnit')
            this.purchasingPriceResult = document.getElementById('purchasingPriceResult')
            this.itemImg = $('#itemImg')
            this.createitemBoxBtn = document.getElementById('openAdditemBox')
            this.closeAdditemBoxBtn = document.getElementById('closeAdditemBox')
            this.saveNewItem = document.getElementById('addNewitem')
            // this.$sortmenu = $('.sort-menu_btn')

            // this.$sortmenu = $('.sort-menu_btn')
            this.$sort = $('.sort')

        },
        bindEvents: function () {

            this.$searchname.on('keyup', this.searchItemName.bind(this))
            // this.$sort.on('click', this.startSort.bind(this))


            this.$itemName.on('keyup', this.getItemName.bind(this))
            this.$itemDesc.on('keyup', this.getItemDesc.bind(this))
            this.$itemDiscount.on('keyup', this.getItemDiscount.bind(this))
            this.$itemfeatured.on('change', this.getItemFeatured.bind(this))
            this.$itempopular.on('change', this.getItemPopular.bind(this))
            $('body').on('change', '.itemGroupResult', this.showCategoryInputs.bind(this))

            this.quantity.addEventListener('keyup', this.getItemQuantity.bind(this))
            this.sellingPriceResult.addEventListener('keyup', this.sellingPrice.bind(this))
            this.purchasingPriceResult.addEventListener('keyup', this.purchasingPrice.bind(this))
            this.itemImg.on('change', this.getitemImages.bind(this))
            this.createitemBoxBtn.addEventListener('click', this.openCreateProduct.bind(this))
            this.closeAdditemBoxBtn.addEventListener('click', this.closeCreateProduct.bind(this))
            this.saveNewItem.addEventListener('click', this.getSingleItemData.bind(this))

            $('.double-slider input[type="range"]').on('input', this.getQuantitySliderVal.bind(this))


            // $('.confirm-unit').on('click', this.confirmProductUnit.bind(this))



        },
        addDynamicEvents: function () {
            $('body').on('click', '.filter-shipments', this.filterItems.bind(this))
            $('body').on('click', '.remove-filter', this.removeFilter.bind(this))
            $('body').on('click', '.sort', this.sortItems.bind(this))

            $('body').on('click', '.content-item', this.openOrder.bind(this))
            $('body').on('click', '.close-single-item', this.closeSingleItem.bind(this))

            $('body').on('click', '.deleteitem', this.deleteitem.bind(this))
            $('body').on('click', '.edit-stock', this.editItemInfo.bind(this))
            $('body').on('click', '.remove-selected-image', this.removeImageFromSelections.bind(this))

            $('body').on('click', '.remove-attr', this.removeAttrField.bind(this))

            $('body').on('click', '#addAttrBtn', this.addNewAttributeInput.bind(this))
            $('body').on('change', 'input[name=attributeName]', this.getAttributeName.bind(this))

            $('body').on('keyup', '.currentInput', this.addOption.bind(this))
            $('body').on('keyup', '.option-price', this.addOption.bind(this))
            $('body').on('click', '.tag-span i', this.deleteOption.bind(this))



            $('body').on('click', '.close-external-box', function (e) { $('.external-box.edit').remove() })



            $('body').on('click', '.get-new-images', this.openFileForm.bind(this))
            $('body').on('click', '.upload-images', this.uploadNewImages.bind(this))
            $('body').on('click', '.delete-image', this.deleteItemImage.bind(this))
            $('body').on('change', '#updatedimages', this.getUpdatedImages.bind(this))

            $('body').on('click', '.change-category', this.changeItemCategory.bind(this))

            $('body').on('click', '.refund-item', this.refundItem.bind(this))
            $('body').on('click', '.get-invoice', this.purchasingInvoice.bind(this))


            $('body').on('change', '#sub', this.getsubCategory.bind(this));

            $('body').on('click', '.close-change-category', function () {
                $('.update-categories').addClass('none')
                $('.update-categories .changeItemCategory').empty()
            });


        },
        getCategory: async function (e) {
            const data = await fetchdata(this.jwt, `/admin/api/category`, 'get', {}, true)
            // if (data != null) {
            this.allCategories = data.json.categories
            return displayCategories(data.json.categories)
            // }
        },
        getItems: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/items', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderItems(data.json.items)
                return this.companyitems = data.json.items
            }
        },
        detectScanner: function () {
            $(document).scannerDetection({
                timeBeforeScanTest: 200,
                avgTimeByChar: 40,
                // it's not a barcode if a character takes longer than 100ms
                // wait  for the next character for upto 200ms 
                preventDefault: true, endChar: [13],
                onComplete: function (barcode, qty) {
                    validScan = true;
                    // $('#scannerInput').val(barcode);
                    if (validScan) {
                        const item = state.findSingleitem(barcode)
                        if (item) {
                            return singleProduct(item)
                        } else {
                            return showmessage("No matched item found!!.", "info", 'body')
                        }
                    } else {
                        return showmessage("Try to scan again.", "info", 'body')
                    }
                },
                // main callback function
                onError: function (string, qty) {
                    console.log();
                }
            });
        },
        renderItems: function (items) {
            removeFullBack()
            $('.content-item').remove()
            if (items.length == 0) return $("main .content").prepend(emptycontent())
            items.forEach(p => productCard(p))
            return this.showItemsSummery(items)
        },
        showItemsSummery: function (items) {
            let overallQty = 0
            items.forEach(i => overallQty += i.info.quantity)
            $('#operations-summary').empty()
            $('#operations-summary').append(`
                <span>Items: ${items.length}</span>
                <span>Over All Quantity: ${overallQty}</span>
            `)
        },


        //Start filters
        searchItemName: function (e) {
            var str = event.target.value.toLowerCase()
            var filteredArr = state.companyitems.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || state.checkName(xSub, str)
            });
            state.renderItems(filteredArr)
        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => { return `(?=.*${x})` }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
        // startSort: function (e) {
        //     let sorted
        //     if (this.filteredItems.length > 0) {
        //         sorted = this.sortItems(this.filteredItems)
        //     } else {
        //         sorted = this.sortItems(this.companyitems)
        //     }
        //     this.renderItems()

        // },
        // sortItems: function (items) {
        //     let sorted = []
        //     bubbleSort(items)
        //     function bubbleSort(arr) {
        //         var noSwaps;
        //         for (var i = arr.length; i > 0; i--) {
        //             noSwaps = true
        //             for (var j = 0; j < i - 1; j++) {
        //                 if (arr[j].info.quantity > arr[j + 1].info.quantity) {
        //                     var temp = arr[j]
        //                     arr[j] = arr[j + 1]
        //                     arr[j + 1] = temp
        //                     noSwaps = false
        //                 }
        //             }
        //             if (noSwaps) break;
        //         }
        //         return sorted = arr
        //     }
        //     return sorted
        // },

        openCategoryOptions: function (e) {
            e.stopPropagation()
            $('.category-options').not($(e.target).parents('.mainGroup').find('.category-options')).removeClass('block')
            $(e.target).parents('.mainGroup').find('.category-options').toggleClass('block')
            $('body').on('click', function () {
                $('.category-options').removeClass('block')
            })
        },


        // Get slider values
        getQuantitySliderVal: function (e) {
            // Get inputs by container

            // Split the elements From/To Slider and From/To values so you can handle them separtely 
            const fromSlider = $(e.target).parent().children('input[type="range"].from'),
                toSlider = $(e.target).parent().children('input[type="range"].to'),
                fromValue = parseInt($(e.target).parent().children('input[type="range"].from').val()),
                toValue = parseInt($(e.target).parent().children('input[type="range"].to').val()),
                currentlySliding = $(e.target).hasClass('from') ? 'from' : 'to',
                outputElemFrom = $(e.target).parent().children('.value-output.from'),
                outputElemTo = $(e.target).parent().children('.value-output.to');

            // Check which slider has been adjusted and prevent them from crossing each other 
            if (currentlySliding == 'from' && fromValue >= toValue) {
                fromSlider.val((toValue - 1));
                fromValue = (toValue - 1);
            } else if (currentlySliding == 'to' && toValue <= fromValue) {
                toSlider.val((fromValue + 1));
                toValue = (fromValue + 1);
            }

            // Updating the output values so they mirror the current slider's value
            outputElemFrom.html(fromValue);
            outputElemTo.html(toValue);
            this.filterByQuantity(fromValue, toValue)
            // Caluculating and setting the progressbar widths    
            $('.progressbar_from').css('width', ((fromSlider.width() / parseInt(fromSlider[0].max)) * fromSlider[0].value) + "px");
            $('.progressbar_to').css('width', (toSlider.width() - ((toSlider.width() / parseInt(toSlider[0].max)) * toSlider[0].value)) + "px");
        },
        filterByQuantity: function (from, to) {
            $('#inventory-items .loading').addClass('block')
            let items = []
            state.companyitems.forEach(i => {
                if (i.info.quantity > from) {
                    if (i.info.quantity <= to) {
                        items.push(i)
                    }
                }
            });
            state.renderItems(items)
            $('#inventory-items .loading').removeClass('block')
        },
        //End filters




        ///////// Start Creating Item ////////
        openCreateProduct: function () {
            $('#add-item').addClass('slide')
            this.creating = true
            console.log(this.itemCategory);
            this.resetData()

        },
        closeCreateProduct: function () {
            this.resetData()
            $('#add-item').removeClass('slide')
            this.creating = false

        },
        returnbarcode: function (barcode) {
            const exist = state.companyitems.find(i => i.barcode.toString() === barcode.toString())
            if (state.creating) {
                const state = $('#itemBarcode').prop('checked')
                if (state) {
                    if (exist) {
                        return showmessage('Item with same barcode exist already', 'info', 'body')
                    }
                    state.barcode = barcode
                } else {
                    state.barcode = null
                }
            } else {
                if (!exist) return showmessage('No item found matched this barcode', 'info', 'body')
                return singleProduct(exist)

            }
        },
        detectScanner: function () {
            $(document).scannerDetection({
                timeBeforeScanTest: 200,
                avgTimeByChar: 40,
                // it's not a barcode if a character takes longer than 100ms
                // wait  for the next character for upto 200ms 
                preventDefault: true, endChar: [13],
                onComplete: function (barcode, qty) {
                    validScan = true;
                    // $('#scannerInput').val(barcode);
                    if (validScan) {
                        return state.returnbarcode(barcode)
                    }
                },
                // main callback function
                onError: function (string, qty) {
                    console.log();
                }
            });
        },
        getItemName: function (e) {
            this.itemName = e.target.value
            const valid = validateInput(e.target)
            if (!valid) {
                delete this.progressprecentage.itemName
            } else {
                this.progressprecentage['itemName'] = ('itemName' || 0) + 1
            }
            this.precentage()
        },
        getItemDiscount: function (e) {
            let discount = $(e.target).val()
            if (discount < 0 || discount == '') $(e.target).val(0)
            if (discount > 100) $(e.target).val(100)
            this.discount = $(e.target).val()
        },
        getItemFeatured: function (e) {
            const state = e.target.checked
            console.log(state);
            this.featured = state
        },
        getItemPopular: function (e) {
            const state = e.target.checked
            console.log(state);
            this.popular = state
        },
        getItemDesc: function (e) {
            $('.item-preview_desc b').html($(e.target).val())
            this.itemDescription = $(e.target).val()
        },
        getItemQuantity: function (e) {
            let qty = e.target.value
            if (qty == 0) {
                e.target.value = 1
            }
            this.itemQuantity = e.target.value
            const valid = validateInput(e.target)
            if (!valid) {
                delete this.progressprecentage.itemQuantity
            } else {
                this.progressprecentage['itemQuantity'] = ('itemQuantity' || 0) + 1
            }
            $('.item-preview_quantity b').html(e.target.value)
            this.precentage()
        },
        sellingPrice: function (e) {
            this.itemSellingPrice = e.target.value
            const valid = validateInput(e.target)
            if (!valid) {
                delete this.progressprecentage.itemSellingPrice
            } else {
                this.progressprecentage['itemSellingPrice'] = ('itemSellingPrice' || 0) + 1
            }
            this.precentage()
            // this.calcMainUnitPercentage()
        },
        purchasingPrice: function (e) {
            this.itemPurchasingPrice = e.target.value
            $('.item-preview_purchasingprice b').html(e.target.value)
            if ($(e.target).val() != '') {
                this.progressprecentage['itemPurchasingPrice'] = ('itemPurchasingPrice' || 0) + 1
            } else {
                delete this.progressprecentage.itemPurchasingPrice
            }
            this.precentage()
        },

        showCategoryInputs: function (e, category) {

            const categoryName = category || $(e.target).val()
            this.itemCategory.name = categoryName
            $('#sub').empty()
            if (categoryName == 'default') return $('#sub').addClass('none')
            const existcategory = this.allCategories.find(g => g.name == categoryName)
            if (existcategory) {
                if (existcategory.subCategory.length === 0) return $('#sub').addClass('none')
                $('#sub').removeClass('none')
                $('#sub').append(`<option disabled selected>Choose Sub Category</option> `)
                existcategory.subCategory.forEach(a => $('#sub').append(`<option value="${a}">${a}</option> `))
            }
        },
        getsubCategory: function (e) {
            const sub = $(e.target).val()
            if (sub) {
                this.itemCategory.subCategory = sub
            } else {
                this.itemCategory.subCategory = null
            }
        },


        getAttributeName: function (e) {
            const attrNo = $(e.target).parents('.attribute').data('attribute-number')
            const attr = this.attributes.find(a => a.attrNo == attrNo)
            attr.name = $(e.target).val()
            this.attributes = this.attributes.filter(a => a.attrNo != attrNo)
            this.attributes.push(attr)
        },
        showAttrs: function (attrs) {
            console.log(attrs);

            $('.attribute').remove()
            if (attrs.length > 0) {

                attrs.forEach((a, i) => {
                    $('.add-category-items_attrsbox').append(`
            <div class="attribute" data-attribute-number="${i}">
                <div>
                    <label for="attributeName">اسم الصفه</label>
                    <input class="form-control" type="text" name="attributeName" class="attributeName" value="${a.name}" placeholder="e.g sizes">
                </div>
                <div class="options">
                    <label for="options">الاختيارات</label>
                    <ul class="tags flex">
                        <li>
                            <input class="currentInput form-control" type="text" placeholder="اسم الاختيار">
                        </li>
                        <li>
                            <input class="option-price form-control" type="number" placeholder="سعر الاختيار" min="0" value="0">
                        </li>
                        <ul class="flex">
                        </ul>
                    </ul>
                </div>
                <i class="fas fa-trash remove-attr close i-bg i-bg-large bg-darkgray" style="left:10px; color:red"></i>
            </div>
            
            `)
                    a.options.forEach(o => {
                        $(`[data-attribute-number="${i}"]`).find('.tags').find('ul').append(`<li data-optionval="${o.name}" class="options btn btn-info btn-small tag-span m-3">${o.name} / ${o.price}<i class="fas fa-times"></i></li>`);

                    })
                })
            }

        },
        addNewAttributeInput: function () {
            const attributeLength = $('.add-category-items_attrsbox .attribute').length
            console.log(attributeLength);

            if (attributeLength == 3) return showmessage('لقد وصلت للحد الاقصي من الصفات', 'info', 'body')
            this.attributes.push({
                name: '',
                attrNo: attributeLength,
                options: []
            })
            this.showAttrs(this.attributes)

        },
        removeAttrField: function (e) {
            const attrNo = $(e.target).parents('.attribute').data('attribute-number')

            //do this its not deleting on editing because not have number proprety        
            this.attributes = this.attributes.filter(a => a.attrNo != attrNo)

            if (this.attributes.length < 3) {
                $('#addAttrBtn').removeClass('none')
            } else {
                $('#addAttrBtn').addClass('none')
            }
            this.showAttrs(this.attributes)
        },
        copyToAll: function (e) {
            $(`.${e.target.dataset.field}`).each(function () { $(this).val(document.querySelector(`.${e.target.dataset.field}`).value) })
        },


        addOption: function (e) {
            var keyBoardKey = e.keyCode || e.which;
            if (keyBoardKey === 13) {
                var optionName = $(e.target).parents('.options').find('.currentInput')
                var optionPrice = $(e.target).parents('.options').find('.option-price')

                if (optionName.val() != '') {
                    const attrIndex = this.attributes.findIndex(a => a.attrNo == $(e.target).parents('.attribute').data('attribute-number'))
                    const exist = this.attributes[attrIndex].options.find(o => o.name == optionName.val())
                    this.attributes[attrIndex].name = $(e.target).parents('.attribute').find('input[name=attributeName]').val()
                    if (!exist) {
                        if (this.attributes[attrIndex].options.length === 4) return showmessage('لقد وصلت للحد الاقصي من الاختيارات', 'info', 'body')
                        this.attributes[attrIndex].options.push({ name: optionName.val().toLowerCase().toString().trim(' '), data: '', price: optionPrice.val() })
                        optionName.val('');
                        optionPrice.val(0);
                        this.showAttrs(this.attributes)
                    }
                }
            }

        },
        deleteOption: function (e) {

            const optionName = $(e.target).parents('li').data('optionval')
            const attrNo = $(e.target).parents('.attribute').data('attribute-number')
            const attrIndex = this.attributes.findIndex(a => a.attrNo == attrNo)
            this.attributes[attrIndex].options = this.attributes[attrIndex].options.filter(o => o.name != optionName)
            this.showAttrs(this.attributes)

        },



        // confirmProductUnit: function (e) {

        //     const valid1 = validateInput(document.querySelector('.unitName'))
        //     const valid2 = validateInput(document.querySelector('.unitPercentage'))
        //     if (valid1 && valid2) {
        //         const unitName = $(".unitName").val()
        //         const unitPercentage = parseInt($('.unitPercentage').val(), 10)
        //         const exsitUnit = this.itemUnits.find(u => u.name == unitName)

        //         if (exsitUnit) return showmessage('Unit with same info already choosen', 'info', 'body')

        //         const unieqNo = this.checkUnitNo(this.fourdigitsrandom())
        //         this.itemUnits.push({
        //             unitNo: unieqNo,
        //             name: unitName,
        //             percentage: unitPercentage,
        //             price: unitPercentage
        //         })

        //         this.showChoosenUnits()
        //     }

        // },
        fourdigitsrandom: function () { return Math.floor(1000 + Math.random() * 9000) },
        checkUnitNo: function (unieqNo) {
            const exist = state.itemUnits.find(u => u.unitNo == unieqNo)
            if (exist)
                return state.checkUnitNo(state.fourdigitsrandom())
            else
                return unieqNo
        },
        showChoosenUnits: function () {
            $('.choosen-units').empty()
            if (state.itemUnits.length > 0) {
                state.itemUnits.forEach(u => {
                    $('.choosen-units').append(`
                        <div class="choosen-units_unit choosen-item p-relative"  data-unit-name="${u.name}">
                            <p>${u.name}</p>
                            <p>${u.percentage} LE</p>
                            <span></span>
                            <i class="remove-item fas fa-trash c-r remove-unit"></i>
                        </div>`)
                })
            } else { $('.choosen-units').append(`<span>No Choosen Units</span>`) }
            $(".unitName").val('')
            $(".unitPercentage").val('')
        },


        saveItem: async function (item) {
            const newform = createItemForm(item)
            $('#add-item').addClass('loader-effect')
            $('.arrow').addClass('auto')
            let data
            if (state.editing) {
                data = await fetchdata(state.jwt, `/admin/api/items/${state.editingItem}`, 'put', newform, false)
            } else {
                data = await fetchdata(state.jwt, `/admin/api/items/`, 'post', newform, false)
            }
            $('#add-item').removeClass('loader-effect')

            if (data != null) {
                showmessage(data.json.message, data.json.messageType, 'body')
                if (state.editing) {
                    state.updateItem(state.editingItem, data.json.item)
                    state.closeCreateProduct()
                } else {
                    state.companyitems.push(data.json.item)
                }
                singleProduct(data.json.item)
                state.updateItemElm(data.json.item)
                state.resetData()
            }

            $('.arrow').removeClass('auto')
        },

        ///////// End Creating Item ////////



        ///////// Start Modifyig Inventory Items  ////////
        findSingleitem: function (itemId) {
            return state.companyitems.find(p => p._id === itemId.toString())
        },

        deleteitem: async function (e) {
            e.stopPropagation()

            if (confirm("Are you sure you want to delete this?")) {
                const itemId = findItemId('itemId', e)
                let itemCard = $(`input[value="${itemId}"]`).parents('.content-item')
                itemCard.addClass('loader-effect')
                $('.single-item .inside-wrapper').addClass('loader-effect')

                const data = await fetchdata(this.jwt, `/admin/api/items/${itemId}`, 'delete', true)
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    itemCard.remove()
                    $('.single-item').remove()
                    this.companyitems = this.companyitems.filter(i => i._id.toString() != itemId.toString())
                }
                itemCard.removeClass('loader-effect')
                $('.single-item .inside-wrapper').removeClass('loader-effect')
            } else {
                e.preventDefault()
            }
        },
        editItemInfo: function (e) {
            e.preventDefault();
            e.stopPropagation();
            const itemId = findItemId('itemId', e);
            console.log(itemId);
            const item = this.findSingleitem(itemId)

            if (item) {
                this.showCategoryInputs(null, item.category.name)

                this.editing = true
                this.editingItem = itemId

                this.itemName = item.name
                this.itemQuantity = item.info.quantity
                this.itemPurchasingPrice = item.info.purchasingPrice
                this.itemSellingPrice = item.info.sellingPrice
                this.itemDescription = item.description
                this.discount = item.discount ? item.discount : 0
                this.itemCategory = item.category
                this.attributes = item.attributes
                this.featured = item.featured || false
                this.popular = item.popular || false
                // this.itemUnits = item.units

                $('#itemImg').parents('.form-group').addClass('none')
                $('#itemName').val(item.name)
                $('#quantity').val(item.info.quantity)
                $('#purchasingPriceResult').val(item.info.purchasingPrice)
                $('#sellingPriceResult').val(item.info.sellingPrice)
                $('#itemGroupResult').val(item.category.name)
                $('#itemDiscount').val(this.discount)
                $('#itemDesc').val(item.description)
                document.getElementById("popular").checked = item.popular || false
                document.getElementById("featured").checked = item.featured || false
                if (item.category.subCategory) $('#sub').val(item.category.subCategory)
                // this.showChoosenUnits()
                this.showAttrs(item.attributes)

                $('#add-item').addClass('slide')

            }
            // $(".edit-stock_info").addClass('slide');
        },
        updateItem: function (itemId, update) {
            const itemindex = state.companyitems.findIndex(i => i._id.toString() == itemId.toString())
            state.companyitems[itemindex] = update
        },
        updateItemElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = productCard(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },



        filterItems: function (e) {
            const { filterType, filterVal, filterSku } = this.getFiltertionInfo(e)
            let exist = false
            for (let item of this.filters.types) {
                if (item.filterType === filterType && item.filterVal === filterVal) {
                    exist = true
                    break
                }
            }
            if (!exist) {
                let items = []
                if (filterType == "category") {
                    console.log('heree!!');
                    items = this.filterCategory(filterVal)
                } else {
                    items = this.bubbleSort(this.allItems)
                    if (filterVal == 'high') items = items.reverse()
                }
                this.filters.items = [...this.filters.items, ...items]
                this.filters.types.push({ filterType, filterSku, filterVal, items })
                this.renderItems(this.filters.items)
                renderFilter(this.filters.types)
            }

        },

        filterCategory: function (status) {

            let items = this.companyitems.filter(s => s.category.name === status)
            return items
        },
        removeFilter: function (e) {
            const { filterType, filterVal, filterSku } = this.getFiltertionInfo(e)

            let presestFilters = []
            let presestItems = []
            for (let item of this.filters.types) {
                console.log(item);
                console.log(filterType);
                if (item.filterVal != filterVal && item.filterType == filterType) {
                    console.log('here');
                    presestFilters.push(item)
                    presestItems = [...presestItems, ...item.items]
                }
            }
            this.filters.types = presestFilters
            this.filters.items = presestItems
            if (this.filters.items.length == 0) {
                this.renderItems(this.companyitems)
            } else {
                this.renderItems(this.filters.items)
            }
            renderFilter(this.filters.types)
        },
        getFiltertionInfo: function (e) {
            let filterType;
            let filterVal;
            let filterSku;
            if ($(e.currentTarget).hasClass('filter-shipments')) {
                filterType = $(e.currentTarget).data('filter')
                filterVal = $(e.currentTarget).data('val')
                filterSku = $(e.currentTarget).data('sku')
            } else {
                filterType = $(e.currentTarget).parents('.options-filters_tag').data('filter')
                filterVal = $(e.currentTarget).parents('.options-filters_tag').data('val')
                filterSku = $(e.currentTarget).parents('.options-filters_tag').data('sku')
            }
            return { filterType, filterVal, filterSku }
        },

        sortItems: function (e) {
            const { filterType, filterVal, filterSku } = this.getSortingInfo(e)
            let items = this.companyitems
            if (this.filters.items.length > 0) items = this.filters.items
            const sorted = this.bubbleSort(items, filterType, filterVal)
            this.renderItems(sorted)

        },
        getSortingInfo: function (e) {
            let filterType;
            let filterVal;
            let filterSku;
            if ($(e.target).hasClass('sort')) {
                filterType = $(e.target).data('filter')
                filterVal = $(e.target).data('val')
                filterSku = $(e.target).data('sku')
            } else {
                filterType = $(e.target).parents('.options-filters_tag').data('filter')
                filterVal = $(e.target).parents('.options-filters_tag').data('val')
                filterSku = $(e.target).parents('.options-filters_tag').data('sku')
            }
            return { filterType, filterVal, filterSku }

        },
        bubbleSort: function (arr, sortType, sortVal) {
            let sorted = []
            var noSwaps;
            for (var i = arr.length; i > 0; i--) {
                if (sortType == 'date') {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].createdAt > arr[j + 1].createdAt) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                } else if (sortType == 'price') {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].info.sellingPrice > arr[j + 1].info.sellingPrice) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                } else {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].info.quantity > arr[j + 1].info.quantity) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                }
            }
            if (sortType === 'date') {
                if (sortVal === 'new') arr.reverse()
            } else if (sortType === 'price') {
                if (sortVal === 'high') arr.reverse()

            } else {
                if (sortVal === 'high') arr.reverse()
            }
            return sorted = arr
        },


        openOrder: function (e) {
            const itemId = findItemId('itemId', e)
            const item = this.findSingleitem(itemId)
            singleProduct(item)
        },
        closeSingleItem: function () {
            $('.single-item').removeClass('slide').remove()
            $('.add-unit-box').remove()
            $('.update-categories').addClass('none')
            $('.update-categories .changeItemCategory').empty()
            $('.upload-new-images .thumbnail').remove()
            this.itemImages = []
            $('.upload-new-images').toggleClass('none')
        },
        openFileForm: function () {
            $('.upload-new-images .thumbnail').remove()
            this.itemImages = []
            $('.upload-new-images').toggleClass('none')
        },

        getUpdatedImages: function (event) {
            var files = event.target.files; //FileList object
            const fileValid = this.validateImage(files)
            if (fileValid) {
                this.itemImages = [...files]
                return state.renderChoosenImages('.upload-new-images .images-perview')
            }

        },
        getitemImages: function (event) {
            var files = event.target.files; //FileList object
            const fileValid = this.validateImage(files)
            if (fileValid) {
                $(".inside-wrapper").animate({ scrollTop: $('.inside-wrapper').prop("scrollHeight") }, 1000);

                this.itemImages = [...files]
                return state.renderChoosenImages('.images-perview')
            }
        },
        validateImage: function (files) {
            var validImageTypes = ["image/jpg", "image/jpeg", "image/png"];
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileType = file["type"];
                if ($.inArray(fileType, validImageTypes) < 0) {
                    showmessage('an image has invalid type, only accept jpeg, png or jpg', 'warning', 'body')
                    return false
                } else if (state.itemImages.includes(file)) {
                    showmessage('This image already choosen', 'warning', 'body')
                    return false
                } else {
                    continue
                }
            }
            return true
        },
        renderChoosenImages: function (outputdiv) {

            var output = $(outputdiv);
            for (const file of state.itemImages) {
                if ($("div[data-name='" + file.name + "']").length <= 0) {
                    var picReader = new FileReader();
                    picReader.addEventListener('load', function (event) {
                        var picFile = event.target;
                        output.append(`<div data-name="${file.name}" class="p-relative" ><i class="fas fa-trash close c-r remove-selected-image"></i> <img class="thumbnail" src="${picFile.result}" title="${picFile.name}"/><div>`)
                    });
                    //Read the image
                    picReader.readAsDataURL(file);
                }
            }
        },
        removeImageFromSelections: function (e) {
            const image = $(e.target).parent('.p-relative')
            const persest = state.itemImages.filter(i => i.name != image.data('name'))
            state.itemImages = persest
            if(state.itemImages.length == 0){
                $('#updatedimages').val('')
            }
            image.remove()
            state.renderChoosenImages()

        },
        uploadNewImages: async function (e) {
            const itemId = findItemId('itemId', e)
            let newform = new FormData()
            this.itemImages.forEach(i => { newform.append('image', i) })

            $('.upload-new-images').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/items/images/${itemId}?type=upload`, 'put', newform, false)
            $('.upload-new-images').removeClass('loader-effect')

            if (data != null) {
                this.itemImages = []
                this.updateItem(itemId, data.json.item)
                singleProduct(data.json.item)
                this.renderItems(state.companyitems)
                showmessage(data.json.message, data.json.messageType, 'body')
            }

        },
        deleteItemImage: async function (e) {
            const itemId = findItemId('itemId', e)
            const imageName = $(e.target).parent().find('img').attr('src').replace('http://localhost:3000', '')
            $(e.target).parent().addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/items/images/${itemId}?type=delete`, 'put', JSON.stringify({ image: imageName }), true)
            if (data != null) {
                $(e.target).parent().find('img').remove()
                $(e.target).parent().remove()
                this.itemImages = []
                this.updateItem(itemId, data.json.item)
                this.renderItems(this.companyitems)
                return showmessage(data.json.message, data.json.messageType, 'body')
            }
            $(e.target).parent().removeClass('loader-effect')

        },

        refundItem: async function (e) {
            const itemId = findItemId('itemId', e)
            const qty = prompt('Determine the quantity', '')
            if (qty !== null && qty !== 0 && qty !== '0') {
                if (confirm("Do you want to cofirm the refunded?")) {
                    const data = await fetchdata(state.jwt, `http://localhost:3000/inventory/refund/${itemId}`, 'put', JSON.stringify({ quantity: qty }), true)
                    if (data != null) {
                        showmessage(data.json.message, data.json.messageType, 'body')
                        $(e.target).parents('ul').parents('.item').append(
                            `<div class="marked paidstatuse block alert-warning" style="right:70px">
                             <span tooltip="Refunded" flow="left"><i class="fas fa-sync font-xs"></i></span>
                         </div>`
                        )
                        $(e.target).parents('ul').parents('.item').find('.sub-menu_btn').remove()
                    }
                } else {
                    e.preventDefault()
                }
            }
        },

        editItemUnit: function (e) {
            const itemId = $(e.target).parents('.unit').find('input[name="itemId"]').val();
            const unitId = $(e.target).parents('.unit').find('input[name="unitId"]').val();
            const item = this.companyitems.find(i => i._id.toString() == itemId.toString());
            const unit = item.units.find(u => u._id.toString() == unitId.toString());
            editUnitComponent(itemId, unitId, unit);
            this.choosenInventory.units.forEach(u => { $('#updated-unit-name').append(`<option data-original="false" value="${unit.name}" data-name="${u.name}">${u.name}</option> `) });


        },
        changeItemCategory: function (e) {
            $('.update-categories').removeClass('none')
            $('.update-categories .changeItemCategory').empty()
            $('select.updateCategoryAttrs').parent().remove()

            const itemId = findItemId('itemId', e);
            const item = state.findSingleitem(itemId);
            this.choosenInventory.categories.forEach(g => {
                $('.update-categories .changeItemCategory').append(`<option ${item.category.name == g.name ? 'selected' : ''} value="${g.name.toLowerCase()}">${g.name}</option>`)
                if (item.category.name == g.name) {
                    g.attributes.forEach(a => {
                        // this.itemCategory.attributes.push({ name: a.name, option: a.options[0].name })
                        $('.update-categories').append(`
                             <div class="form-group">
                                 <label>${a.name}</label>
                                 <select class="updateCategoryAttrs form-control" data-updateattrname="${a.name}"> </select>
                             </div>
                         `)
                        a.options.forEach(o => {
                            $(`[data-updateattrname='${a.name}']`).append(`<option data-option="${o.name}" class="btn-small">${o.name}</option>`)
                        })
                    })
                }
            })

            this.itemCategory.attributes = item.category.attributes;
            this.itemCategory.name = item.category.name;
        },
        getChangedItemCategory: function (e) {
            const category = this.choosenInventory.categories.find(g => g.name == $(e.target).val())
            if (category) {
                // $('.changeItemCategory.updateCategoryAttrs').parent().remove()
                $('select.updateCategoryAttrs').parent().remove()
                this.itemCategory.attributes = []
                this.itemCategory.name = category.name
                if (category.attributes.length > 0) {
                    category.attributes.forEach(a => {
                        this.itemCategory.attributes.push({ name: a.name, option: a.options[0].name })
                        $('.update-categories').append(`
                             <div class="form-group">
                                 <label>${a.name}</label>
                                 <select class="updateCategoryAttrs form-control" data-updateattrname="${a.name}"> </select>
                             </div>
                         `)
                        a.options.forEach(o => {
                            $(`[data-updateattrname='${a.name}']`).append(`<option data-option="${o.name}" class="btn-small">${o.name}</option>`)
                        })
                    })
                }

            }
        },






        createItemObject: function (itemName, itemType, itemUnits, itemPlans, itemCategory, itemQuantity, itemPurchasingPrice, itemSellingPrice, itemDescription, asExpenses, periodTime, supplierResult, imagesstate, itemImg, withdraw, barcode, discount, attributes, featured, popular) {

            let newitem = {
                itemName,
                itemType,
                itemUnits,
                itemQuantity,
                itemPurchasingPrice,
                itemSellingPrice,
                itemCategory,
                itemDescription,
                supplierResult,
                asExpenses: asExpenses,
                periodTime: periodTime,
                itemPlans: itemPlans,
                imagesstate,
                itemImg,
                withdraw,
                barcode,
                discount,
                attributes,
                featured,
                popular
            }
            return newitem;
        },
        getSingleItemData: function () {

            const item = this.createItemObject(this.itemName, this.itemType, this.itemUnits, this.itemPlans, this.itemCategory, this.itemQuantity, this.itemPurchasingPrice, this.itemSellingPrice, this.itemDescription, this.asExpenses, this.periodTime, this.supplierResult, true, this.itemImages, this.withdraw, this.barcode, this.discount, this.attributes, this.featured, this.popular)
            const valid = validateItem(item)
            const validAttrs = validateAttrs(this.attributes)
            console.log(item);
            if (valid && validAttrs) return this.saveItem(item)
        },


        purchasingInvoice: function (e) {
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = state.findSingleitem(itemId)
            createInvoiceClass('purchasing', '.invoice-wrapper', item)
            $('.close-invoice').on('click', function (e) { $("#invoice").remove() })
        },


        calcRevenue: function (sales) {
            let totalRevenue = 0;
            sales.forEach(s => {
                totalRevenue += s.totalPrice
            })
            return totalRevenue
        },


        createBarcode: async function (itemId) {
            await JsBarcode("#itemBarcodeCanvas", itemId);
            const canvas = document.getElementById('itemBarcodeCanvas')
            canvas.toBlob(function (blob) {
                var createdurl = URL.createObjectURL(blob);
                const newImg = document.createElement('img')
                newImg.style.maxWidth = '100%'
                newImg.onload = function () {
                    // no longer need to read the blob so it's revoked
                    URL.revokeObjectURL(createdurl);
                };
                newImg.src = createdurl;
                inventory.convertToBlob(blob, 'NEWANSWEFORSTUDNET', itemId)
            })
        },
        convertToBlob: function (theBlob, fileName, itemId) {
            const blobed = inventory.blobToFile(theBlob, fileName, itemId)
        },
        blobToFile: function (theBlob, fileName, itemId) {
            //A Blob() is almost a File() - it's just missing the two properties below which we will add
            theBlob.lastModifiedDate = new Date();
            theBlob.name = fileName;
            // this.allFiles.push({ theBlob, questionId })
            if (theBlob) {
                const formData = new FormData();
                formData.append("image", theBlob);
                $.ajax({
                    url: `/item/addBarcode/${itemId}`,
                    headers: {
                        Authorization: "Bearer " + inventory.jwt
                    },
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        const order = data.order
                    },
                    error: function (err) {
                        console.log(err);
                    }
                })
                $('body').on('click', '#startPrint', addOrder.startPrinting)
                $('body').on('click', '#closeInvoice', addOrder.closeInvoice)
            }
        },
        resetData: function () {
            $('#itemGroupResult').val('default')
            $('.suppliers').trigger('change').val('')

            state.itemType = 'consumable'
            state.itemName = ''
            state.itemCategory = { name: 'default', attributes: [], subCategory: null }
            state.itemSellingPrice = null
            state.itemPurchasingPrice = null
            state.itemQuantity = 1
            state.discount = 0
            state.itemPlans = []
            state.itemUnits = []
            state.attributes = []
            state.barcode = null
            state.itemDescription = ''
            state.featured = false
            state.popular = false
            state.itemImages = []
            state.supplierResult = null
            state.periodTime = false
            state.editingItem = null
            state.editing = false
            state.scheduleState = false
            state.supplierState = false
            state.supplier = null
            state.progressprecentage = {}
            $('#itemImg').parents('.form-group').removeClass('none')
            $('#itemDesc').val('')
            $('#itemDiscount').val(0)
            $('.itemName').val('')
            $('#quantity').val(1)
            $('#purchasingPriceResult').val('')
            $('#sellingPriceResult').val('')
            $('#add-item .images-perview img').remove()
            $('input[data-state]').attr('data-state', 'unset')
            $('#sub').empty().addClass('none')
            $('.choosen-units_unit').remove()
            document.getElementById('featured').checked = false
            document.getElementById('popular').checked = false
            state.showAttrs(state.attributes)
            state.precentage()
        },
        precentage: function () {
            let fullfiled = 0
            if (state.itemType == 'consumable') {
                if (state.supplierState) {
                    for (const i in state.progressprecentage) {
                        fullfiled += 16.6
                    }
                } else {
                    for (const i in state.progressprecentage) {
                        fullfiled += 20
                    }
                }
            } else {
                for (const i in state.progressprecentage) {
                    fullfiled += 33.3
                }
            }
            if (fullfiled > 98) {
                $('.precentage').css({ background: '#38ff00' })
            } else {
                $('.precentage').css({ background: '#00365a' })
            }
            $('.precentage').animate({ width: (fullfiled) + '%' }, 300)
        }
    }

    state.init()
})()