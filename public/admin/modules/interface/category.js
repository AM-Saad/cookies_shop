/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allItems: [],
        subCategories: [],
        itemImg: null,
        opened: null,
        editing: false,
        init: async function () {
            this.cashDom()
            this.bindEvents()
            this.getItems()

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateItembox = $('.toggle-new-item')
            this.$categoryImg = $('#image')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {
            this.$togglefilters.on('click', this.togglefilters.bind(this))

            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            this.$searchname.on('keyup', this.searchCustomerName.bind(this))
            this.$categoryImg.on('change', this.getCategoryImg.bind(this))


            $('body').on('click', '.content-item', this.openItem.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleCustomer.bind(this))
            $('body').on('click', '.customer-shipments .order', this.openShipmentBox.bind(this))
            $('body').on('click', '.customer-shipments .close-shipments', this.closeShipments.bind(this))

            $('.new-item-box form').on('submit', this.saveItem.bind(this))

            $('body').on('click', '.edit-item', this.editItem.bind(this))

            $('body').on('click', '.delete-item', this.deleteItem.bind(this))

            $('#add-subcategory').on('click', this.getsubCategory.bind(this))
            $('body').on('click', '.delete-sub', this.deletesub.bind(this))

        },
        togglefilters: function (e) { $('.section-filters').toggleClass('block') },


        toggleCreateInventory: function () {
            $('.create-inventory').toggleClass('none')
        },
        openmenu: function (e) {
            e.stopPropagation()
            e.preventDefault()
            console.log('a');
            $('.wrapper').off('click')
            $('.sub-menu').not($(e.target).parent().find('.sub-menu')).removeClass('activeMenu')
            $(e.target).parent().find('.sub-menu').toggleClass('activeMenu')
            $('.wrapper').on('click', function () {
                $('.sub-menu').removeClass('activeMenu')
            })
        },
        getItems: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/category', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderItems(data.json.categories)
                return this.allItems = data.json.categories
            }
        },
        searchCustomerName: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toLowerCase()
            var filteredArr = config.allItems.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || config.checkName(xSub, str)
            })
            console.log(filteredArr);

            config.renderItems(filteredArr)

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getItemObeject: function (e) {
            const itemId = findItemId('itemId', e)
            console.log(itemId);
            const zone = config.filterSingleItem(itemId)
            return zone
        },

        filterSingleItem: function (itemId) {
            const zone = this.allItems.find(c => { return c._id.toString() === itemId.toString() })
            return zone
        },
        openItem: function (e) {
            const item = this.getItemObeject(e)
            this.opened = item._id
            return createSingleItem(item)

        },
        closeCustomer: (e) => {
            $('.single-item').remove()
        },
        togglecreateItembox: function (e) {
            $('.new-item-box').toggleClass('slide')
            if ($('.new-item-box').hasClass('slide')) $('#name').focus()
            this.resetData()
        },

        createItemForm: function () {
            const name = $('#name').val();
            const order = $('#order').val();
            console.log($('#tag').data('ar'));
            const tag = { en: $('#tag').val(), ar: $('#tag').find(":selected").data('ar') };
            console.log(tag);
            const active = document.getElementById('active').checked
            console.log(active);
            if (!name.replace(/\s/g, '').length) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            } else {
                let formData = new FormData();
                formData.append("name", name)
                formData.append("order", order)
                formData.append("active", active)
                formData.append("tag", JSON.stringify(tag))
                formData.append("subCategories", JSON.stringify(config.subCategories))
                if (config.itemImg) {
                    formData.append("image", config.itemImg)
                }
                return formData
            }
        },
        getCategoryImg: function (e) {
            var files = e.target.files[0]; //FileList object
            const fileValid = this.validateImage(files)
            console.log(fileValid);
            if (fileValid) {
                this.itemImg = files
            }


        },
        validateImage: function (files) {
            var validImageTypes = ["image/jpg", "image/jpeg", "image/png"];
            var file = files;
            var fileType = file["type"];
            if ($.inArray(fileType, validImageTypes) < 0) {
                showmessage('الامتدادت المقبوله هي jpeg, png or jpg', 'warning', 'body')
                return false
            }
            return true
        },
        saveItem: async function (e) {
            e.preventDefault()
            const newform = this.createItemForm()
            if (newform != false) {
                $('.new-item-box').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/category/${this.opened}`, 'put', newform, false)
                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/category', 'post', newform, false)
                }
                $('.new-item-box').removeClass('loader-effect')
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    if (this.editing) {
                        this.updateItem(data.json.category)
                        this.togglecreateItembox()
                        createSingleItem(data.json.category)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {
                        this.allItems.push(data.json.category)
                        this.togglecreateItembox()
                    }
                    this.updateItemElm(data.json.category)

                    this.resetData()
                }

            }

        },
        updateItem: async function (updatedObj) {
            const oldIndex = config.allItems.findIndex(d => d._id.toString() === updatedObj._id.toString())
            config.allItems[oldIndex] = updatedObj
            return oldIndex
        },
        updateItemElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        editItem: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = this.allItems.find(c => c._id.toString() == itemId.toString())
            this.opened = item._id
            this.subCategories = item.subCategory
            this.editing = true

            $('#name').val(item.name);
            $('#order').val(item.order);
            $('#tag').val(item.tag.en)
            this.subCategories.forEach(sub => $('.tags').append(`<button data-sub="${sub}">   <i class="fas fa-times delete-sub"></i>${sub} </button>`))

            document.getElementById('active').checked = item.active
            $('.new-item-box').addClass('slide')

        },
        resetData: function (e) {
            document.getElementById('active').checked = true
            $('#name').val('');
            $('#order').val('');
            $('.tags').empty();
            config.subCategories = []
            config.editing = false
        },


        renderItems: function (customers) {
            $('.content .loading').removeClass('block')
            $('.content-item').remove()
            removeFullBack()

            if (customers.length === 0) return $("main .content").prepend(emptycontent())
            customers.forEach(s => createitemBox(s))
        },


        closeSingleCustomer: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },
        getsubCategory: function (e) {

            const sub = $('#sub').val().toLowerCase()

            if (sub) {
                const exist = this.subCategories.find(s => s == sub)
                if (!exist) {
                    this.subCategories.push(sub)
                    $('.tags').append(`<button data-sub="${sub}">
                <i class="fas fa-times delete-sub"></i>
                ${sub}
                </button>`)
                }
            }
            $('#sub').val('')
        },
        deletesub: function (e) {

            const sub = $(e.target).parent('button').data('sub').toLowerCase()

            this.subCategories = this.subCategories.filter(s => s != sub)
            $(e.target).parent('button').remove()
            console.log(this.subCategories);

        },

        deleteItem: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Item?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/category/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleCustomer()
                        showmessage('تم الحذف', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },



        searchShipmentSerial: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toString()
            var filteredArr = config.openedShipments.filter((i) => {

                var xSub = i.serial.toString()
                return i.serial.toString().includes(str) || config.checkSerial(xSub, str)
            })
            config.renderShipments(filteredArr)

        },
        checkSerial: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
        closeShipments: function (e) {
            $('.customer-shipments').removeClass('slide')
            $('.customer-shipments .order').remove()
            config.openedShipments = []
        },
        openShipmentBox: function (e) {
            let orderId
            if ($(e.target).hasClass('.order')) {
                orderId = $(e.target).find('input[name="orderId"]').val()
            } else {
                orderId = $(e.target).parents('.order').find('input[name="orderId"]').val()
            }

            const order = config.openedShipments.find(o => { return o.id == orderId })
            const itemsBox = $(e.target).parents('.order').find('.itemsBox')

            if (!itemsBox.has('.item').length > 0) {
                itemsBox.removeClass('none')
                order.items.forEach(i => {
                    if (i.hasPeriodTime) {

                        itemsBox.append(`
                        <div class="grid bg-w p-3 border-1-b">
                        <p class="item">${i.name}</p >
                        <p>Plan:${i.plan.unit}</p>
                        <p>Plan:${i.plan.price}</p>
                        <p>Duration:${i.plan.periodTime.from} - ${i.plan.periodTime.to}</p>

                        </div>
                        `)
                    } else {

                        itemsBox.append(`
                        <div class="flex f-space-around bg-w p-3 border-1-b p-relative">
                        ${i.refunded ?
                                `<div class="marked paidstatuse block alert-warning" style="right:70px">
                                <span tooltip="Refunded" flow="left"><i class="fas fa-sync font-s"></i></span>
                            </div>`
                                : ''}
                        <p class="item">${i.name}</p>
                        <p>Quantity:${i.quantity}</p>
                        </div>
                        `)
                    }
                })
            } else {
                itemsBox.addClass('none')
                itemsBox.empty()
            }

        },


    }
    config.init()
})()



