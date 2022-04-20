/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/
(function () {
    const config = {
        companyitems: [],
        jwt: localStorage.getItem('token'),
        session: $('input[name=sessionId]').val(),
        choosenitems: [],
        filteredItems: [],
        allCustomers: [],
        allPromos: [],
        allZones: [],
        onSetItem: null,
        selectedcustomer: null,
        selectedpromo: null,
        selectedarea: null,
        fetchedsales: [],
        lastSales: null,
        editing: false,
        editingOrder: null,
        init: async function () {
            $('.wrapper').addClass('loader-effect')

            this.cashDom()
            this.bindEvents()
            await this.getitems()
            this.detectScanner()
            await this.getcustomers()
            await this.getZones()
            await this.getPromos()

            await this.checkEditing()
            $('.wrapper').removeClass('loader-effect')


        },
        cashDom: function () {
            this.$loading = $('.loading')
            this.$shippingAddress = $('#shippingaddress')
            this.$moreinfo = $('#more-info')
            this.$searchname = $('#search-name')
            this.submitSalesBtn = document.getElementById('submitSales')
            this.itemsDiv = $('#allProducts')
            this.$toggleItemFilter = $('.toggle-items-filter')
            // this.quantity = document.getElementById('quantity')

        },
        bindEvents: function () {
            $('body').on('click', '.item', this.selectItem.bind(this))
            $('body').on('click', '.removeChoosenitem', this.removeChoosenitem.bind(this))

            $('body').on('change', '.units', this.getItemUnit.bind(this))
            $('body').on('click', '.confirmItem', this.checkQuantity.bind(this))
            $('body').on('click', '.closeQuantityBox', this.closeQuantityBox.bind(this))


            // $('body').on('click', '#all-customers li', this.customerId.bind(this))

            $('body').on('click', '.drobdown_list_item', this.getChoosenListItem.bind(this))
            $('.list-input').on('keyup', this.searchListItem.bind(this))

            $('.list-btn').on('click', this.showDropdownList.bind(this))


            this.$toggleItemFilter.on('click', this.toggleItemFilters)
            this.$searchname.on('keyup', this.searchItemName.bind(this))


            this.submitSalesBtn.addEventListener('click', this.saveSales.bind(this))
            // this.quantity.addEventListener('change', this.getQuantity.bind(this))

            this.$moreinfo.on('change', this.openMoreInfobox.bind(this))

            $('body').on('click', '#closeitems', this.closeitemsBoxs.bind(this))

            $('body').on('click', '.options-groups_item.mainGroup', this.getGroupItems.bind(this))



        },
        checkEditing: async function () {
            const edit = $('#editing').val()
            const orderId = $('#order').val()
            if (edit == 'true') {
                this.editing = true
                this.editingOrder = orderId
                const data = await fetchdata(this.jwt, `/admin/api/orders/${orderId}`, 'get', {}, true);
                if (!data) {
                    return setTimeout(() => { window.location.href = '/admin/orders' }, 4000);
                }
                let order = data.json.order
                this.selectedcustomer = order.customer
                this.selectedarea = order.order_info.shipping_details.area.zoneId
                order.items.forEach(i => {
                    i.uid = i._id + new Date().toISOString()
                })
                this.choosenitems = order.items
                console.log(this.choosenitems);
                console.log(this.selectedcustomer);
                console.log(this.selectedarea);
                if (order.customer.id) {
                    $(`div[data-list-name="allCustomers"] ul li[data-value=${order.customer.id}]`).trigger('click')
                }

                $('#phone').val(order.order_info.billing_details.phone)
                $('#apartment').val(order.order_info.shipping_details.apartment)
                $('#floor').val(order.order_info.shipping_details.floor)
                $('#street').val(order.order_info.shipping_details.street)
                $('#deliveryDate').val(order.order_info.delivery_date)
                this.renderChoosenitems(order.items)
                this.calcPrice()
                $('.items-wrapper').addClass('loader-effect')
                $(`div[data-list-name="allZones"] ul li[data-value=${this.selectedarea}]`).trigger('click')
            }
        },
        getitems: async function (e) {
            this.companyitems = []
            const data = await fetchdata(this.jwt, `/admin/api/items/`, 'get', {}, true);
            if (data) {
                this.companyitems = data.json.items
                return this.readyStates()
            }
        },
        toggleItemFilters: function () {
            $('.items-wrapper .filter').toggleClass('none')
        },
        detectScanner: function () {
            $(window).scannerDetection()
            $(window).bind('scannerDetectionComplete', function (e, data) {
                // $("#bCode").val(data.string);
                const item = config.filterSingleItem(data.string);
                if (!item) return showmessage('Cannot Find Matched Item', 'info', 'body')
                return config.checkitemtype(item)

            }).bind('scannerDetectionError', function (e, data) {
            }).bind('scannerDetectionReceive', function (e, data) {
            })
        },
        readyStates: () => {
            renderProducts(config.companyitems, config.itemsDiv)

            // $('#deliveryDate').daterangepicker({
            //     startDate: new Date(),
            //     singleDatePicker: true,
            //     minYear: 2020,
            //     showDropdowns: true,
            //     maxYear: 2030
            // });
            // $('#deliveryDate').on('apply.daterangepicker', function (ev, picker) { config.deliveryDate = picker.startDate.format('YYYY-MM-DD') });


            config.showGroups()

            $('#allProducts .loading').addClass('none')
            $(".overlay").addClass('none')

        },
        showGroups() {
            let categories = {}

            config.companyitems.forEach(i => categories[i.category.name] = (categories[i.category.name] || 0) + 1)
            let arr = Object.keys(categories);
            console.log(categories);

            if (arr.length > 0) {
                arr.forEach(g => {
                    $('.groups').append(`<li class="options-groups_item mainGroup btn-small btn" data-groupname="${g}">${g}</li>`)
                    $('.groups li').eq(0).find(' i').addClass('none')
                })
                $('.get-confirmation').on('click', function (e) {
                    e.preventDefault()
                    e.stopPropagation()
                    config.confirmationbox('delete-group-items', 'delete-group', 'Delete items related to this group?', $(e.target).parents('li').find('.groupId').val())
                })
            }
        },
        showInvoice: function () {
            createInvoiceClass('sales', '.invoice-wrapper', config.lastSales)
            $('#printInvoice').on('click', config.startPrinting)
            $('.close-invoice').on('click', config.closeInvoice)
        },
        closeInvoice: function (e) {
            $('#invoice').remove()
        },
        openSalesSubMenu: function (e) {
            if ($(e.target).parents('.sales').find('.sales-actions').hasClass('activeMenu')) {
                $(e.target).parents('.sales').find('.sales-actions').removeClass('activeMenu')
            } else {
                $('.sales-actions').not($(e.target).parents('.sales').find('.sales-actions')).removeClass('activeMenu')
                $(e.target).parents('.sales').find('.sales-actions').addClass('activeMenu')
            }
        },
        getcustomers: async function (e) {
            if (this.allCustomers.length == 0) {
                const data = await fetchdata(this.jwt, '/admin/api/customers/', 'get', {}, true)
                if (data != null) {
                    this.allCustomers = data.json.customers
                    this.renderCustomers(data.json.customers)
                }
                return $('.customer-box .loading').removeClass('block')

            }
        },
        showDropdownList: function (e) {
            e.preventDefault()
            $(e.target).parents('.drobdown_list').find('.list-box').removeClass('none')

        },
        togglecreatecustomerbox: function (e) {
            $('.new-customer-box').toggleClass('none')
            if (!$('.new-customer-box').hasClass('none')) $('#customerName').focus()
        },
        renderCustomers: async function (customers) {
            $('#all-customers').empty()
            $('#all-customers li').off('click')
            customers.forEach(c => {
                $('#all-customers').append(` <li class="drobdown_list_item" data-value="${c._id}" data-name="${c.name}">${c.name}</li> `)
            })

        },
        customerId(e) {
            e.stopPropagation()
            e.preventDefault()
            this.getcustomerInfo($(e.target).data('value'))
        },

        searchListItem: function (e) {
            const text = $(e.target).val()
            const list = $(e.target).data('list')
            $(`ul[data-list=${list}]`).removeClass('none')
            var str = e.target.value.toLowerCase()
            var filteredArr = this[list].filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || this.checkName(xSub, str)
            })

            if (list === "allPromos") {
                this.renderpromos(filteredArr)
            } else if (list === "allCustomers") {
                config.selectedcustomer = { name: text, id: '' }
                this.renderCustomers(filteredArr)
                if (!text.replace(/\s/g, '').length) config.resetCustomer()
            } else {
                this.renderzones(filteredArr)
            }

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getChoosenListItem: function (e) {
            let listType = $(e.target).parents('ul').data('list')
            let listItemId = $(e.target).data('value')
            let res
            console.log(listType);
            if (listType === 'allCustomers') {
                res = this.getcustomerInfo(listItemId, listType)
            } else if (listType === "allPromos") {
                res = this.getpromoInfo(listItemId, listType)
            } else {
                res = this.getzoneInfo(listItemId, listType)

            }
            $(`input[data-list=${listType}]`).val(res.name)
            $(`.list-box`).addClass('none')

        },
        getcustomerInfo: function (itemId, itemType) {
            const item = config[itemType].find(c => c._id.toString() == itemId.toString())
            config.selectedcustomer = { id: item._id, name: item.name }
            $('#phone').val(item.mobile)
            return item
        },
        resetCustomer: function () {
            config.selectedcustomer = null
            console.log(config.selectedcustomer);
        },
        getpromoInfo: function (itemId, itemType) {
            const item = config[itemType].find(c => c._id.toString() == itemId.toString())
            config.selectedpromo = { id: item._id, name: item.name }
            return item

        },
        getzoneInfo: function (itemId, itemType) {
            const item = config[itemType].find(c => c.zoneId.toString() == itemId.toString())
            config.selectedarea = item.zoneId
            config.calcPrice()
            return item

        },


        getPromos: async function (e) {
            if (this.allPromos.length == 0) {
                const data = await fetchdata(this.jwt, '/admin/api/promos/', 'get', {}, true)
                if (data != null) {
                    this.allPromos = data.json.promos
                    this.renderpromos(data.json.promos)
                }
                return $('.promo-box .loading').removeClass('block')

            }
        },
        getZones: async function (e) {
            if (this.allZones.length == 0) {
                const data = await fetchdata(this.jwt, '/admin/api/zones/', 'get', {}, true)
                if (data != null) {
                    this.allZones = data.json.zones
                    this.renderzones(data.json.zones)
                }
                return $('.promo-box .loading').removeClass('block')

            }
        },
        renderpromos: async function (promos) {
            $('#all-promos').empty()
            $('#all-promos li').off('click')
            promos.forEach(c => {
                $('#all-promos').append(`<li class="drobdown_list_item" data-value="${c._id}" data-name="${c.name}">${c.name}</li> `)
            })

        },
        renderzones: async function (zones) {
            $('#all-zones').empty()
            $('#all-zones li').off('click')
            zones.forEach(c => {
                $('#all-zones').append(`<li class="drobdown_list_item" data-value="${c.zoneId}" data-name="${c.name}">${c.name}</li> `)
            })

        },

        openMoreInfobox: function (e) {
            const moreinfo = $(e.target).prop('checked')
            if (moreinfo) {
                $('.sales-info_advanced').addClass('block')
            } else {
                $('.sales-info_advanced').removeClass('block')
                // this.hideAndRestItemInfo()

                this.leadSource = 'default'
            }

        },
        getGroupItems: function (e) {
            let groupName = $(e.target).data('groupname')
            if (groupName == 'all') return renderProducts(this.companyitems, this.itemsDiv)


            const groupItems = this.companyitems.filter(i => i.category.name == groupName)

            this.filteredItems = groupItems

            renderProducts(groupItems, this.itemsDiv)

        },
        searchItemName: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toLowerCase()
            var filteredArr = this.companyitems.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || this.checkName(xSub, str)
            })

            renderProducts(filteredArr, this.itemsDiv)


        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => { return `(?=.*${x})` }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        closeitemsBoxs: function () {
            $('#allProducts').css({ display: 'none' })
            if (this.choosenitems.length === 0) {
                // $('.sales-info_customItem').css({ display: 'block' })
            }
        },

        selectItem(e) {
            const itemId = this.getitemId(e)
            const item = this.filterSingleItem(itemId)
            this.onSetItem = item
            return this.checkitemtype(item)

        },
        getitemId(e) {
            return e.currentTarget.querySelector('input[name="itemId"]').value
        },
        filterSingleItem: function (itemId) {
            return this.companyitems.find(i => i._id.toString() === itemId.toString())
        },
        checkitemtype: function (item) {
            if (item.type === 'consumable') {
                $('.popUp').removeClass('none')
                $('.popUp #quantity').focus()
                $('.units').empty().addClass('none')
                $('.units').removeClass('none')
                config.onSetAttr = item.attributes[0]
                if (item.attributes.length > 0) {
                    item.attributes.forEach(u => {
                        $('.units').append(`
                            <div class="attrs">
                            <label for=${u._id}>${u.name}</label>
                                <select id=${u._id} data-name="${u.name}" data-attr-name=${u.name}>
                                </select>
                            </div>
                        `)
                        u.options.forEach(o => {
                            $(`select[data-attr-name="${u.name}"]`).append(`<option value=${o.name} data-opt-price="${o.price}" data-opt-name=${o.name} >${o.name}</option>`)
                        })
                    })
                }
                // this.addEventOnItem()
            } else {
                if (!item.periodTime) {
                    return config.createitemObject(item)
                }
            }
        },

        getItemUnit: function (e) {
            const unit = this.onSetItem.units.find(u => u.name == $(e.target).val())
            return this.onSetAttr = unit

        },
        checkQuantity: function () {
            const requestedquantity = parseInt($('#quantity').val(), 10)
            console.log(requestedquantity);

            const item = config.onSetItem
            if (item.info.quantity !== 0) {
                if (requestedquantity > item.info.quantity) {
                    showmessage('الكميه في المخزن اصغر من المطلوبه', 'info', 'body')
                    // config.addEventOnItem()
                    return false
                }
                if (requestedquantity === 0 || requestedquantity === '') {
                    showmessage('برجاء تحديد الكميه', 'info', 'body')
                    // config.addEventOnItem()
                    return false
                }
                $('.popUp').addClass('none')
                const res = config.createitemObject(item, requestedquantity)
                if (res) {
                    item.info.quantity = (item.info.quantity - requestedquantity)
                    const itemIndex = this.companyitems.findIndex(i => i._id.toString() === item._id.toString())
                    this.companyitems[itemIndex] = item
                    renderProducts(this.companyitems, this.itemsDiv)

                    return config.renderChoosenitems(config.choosenitems)
                }

            } else {
                showmessage('لا يوجد كميه في مخزن للطلب', 'error', 'body')
                return false
            }

        },
        closeQuantityBox: function () {

            $('.popUp').addClass('none')
            if (config.choosenitems.length === 0) {
                // $('.sales-info_customItem').css({ display: 'block' })
            }
        },
        calcPrice: function () {
            let totalScore = 0
            let shipping = 0
            config.choosenitems.forEach(p => totalScore += p.total)
            if (config.selectedarea) {
                shipping = config.allZones.find(z => z.zoneId == config.selectedarea).shipping
            }
            totalScore = Math.floor(totalScore)
            $('.shipping-cost').html(`<b>SHIPPING : $${parseInt(shipping, 10)}<b>`)
            $('.untaxed-cost').html(`<b>Total: $${totalScore}<b>`)
            $('.total-cost').html(`<b>Grand Total: $${totalScore + parseInt(shipping, 10)}<b>`)
        },
        getAttrs: function () {
            let attributes = []
            $('.attrs').each(function () {
                let item = $(this).find('select')
                attributes.push({
                    name: item.data('attr-name'),
                    price: item.find(":selected").data('opt-price'),
                    option: item.val()
                })
            })
            return attributes
        },
        createitemObject: function (item, quantity) {

            let attrs = config.getAttrs()
            let total = attrs.reduce((acc, i) => { return acc + parseInt(i.price, 10) }, item.info.sellingPrice)
            let totalAfterDiscount = total - (total * (item.discount / 100))
            let newitem = {
                id: item._id,
                uid: item._id + new Date().toISOString(),
                name: item.name,
                type: item.type,
                quantity: parseInt(quantity, 10),
                price: totalAfterDiscount,
                total: totalAfterDiscount * parseInt(quantity, 10),
                attributes: attrs,
                category: item.category.name,
                image: item.images[0],
                discount: item.discount
            }

            config.updateChoosenitems(newitem, parseInt(quantity, 10))

            return true

            // $(window).scannerDetection()
        },
        updateChoosenitems: function (item, quantity) {
            const exsistitem = config.choosenitems.find(p => p.id.toString() === item.id.toString() && JSON.stringify(item.attributes) == JSON.stringify(p.attributes))
            if (exsistitem) {
                exsistitem.quantity += quantity
                console.log(exsistitem.quantity);
                exsistitem.total = item.price * exsistitem.quantity
                const filtereditems = config.choosenitems.filter(p => p.id.toString() === item.id.toString() && JSON.stringify(item.attributes) == JSON.stringify(p.attributes))
                filtereditems.push(exsistitem)

            } else {
                const olditems = [...config.choosenitems]
                olditems.push(item)
                config.choosenitems = olditems

            }

            config.renderChoosenitems(config.choosenitems)

            config.calcPrice()

        },
        renderChoosenitems: function (items) {
            $('#choosenitems').html('')
            choosenProducts(items)

            config.choosenPlan = null
            config.periodTime = { from: 'Not specified', to: 'Not specified' }
        },
        removeChoosenitem: function (e) {
            const itemId = $(e.target).parent().find('input[name="itemId"]').val()
            const id = $(e.target).parent().data('uid')
            const originalitem = this.filterSingleItem(itemId)
            if (originalitem.type === 'consumable') {
                const removedItem = this.choosenitems.find(p => p.uid.toString() === id.toString())
                originalitem.info.quantity += removedItem.quantity
            }

            this.choosenitems = this.choosenitems.filter(p => p.uid.toString() != id.toString())
            const itemIndex = this.companyitems.findIndex(i => i._id.toString() === itemId.toString())
            this.companyitems[itemIndex] = originalitem
            renderProducts(this.companyitems, this.itemsDiv)
            if (this.choosenitems.length == 0 && this.externalItem == null) $('#choosenitems').append('<h3>Selected Item</h3><span>No Items...</span>')


            $(e.target).parent().remove()
            return config.calcPrice()
        },
        createItemForm: function (e) {

            let sale = {
                channel: 'System',
                firstname: config.selectedcustomer ? config.selectedcustomer.name : null,
                lastname: '',
                phone: $('#phone').val(),
                email: $('#email').val(),
                area: config.selectedarea,
                apartment: $('#apartment').val(),
                floor: $('#floor').val(),
                street: $('#street').val(),
                items: config.choosenitems,
                customer: config.selectedcustomer,
                status: { no: 1, text: 'تحت الطلب', en: 'Pending' },
                lead_source: leadSource,
                delivery_date: $('#deliveryDate').val(),
                note: $('#description').val()

            }
            return sale
        },
        validateOrder: function (sales) {

        },
        saveSales: async function (e) {
            let sales = this.createItemForm()
            let data
            if (sales) {

                $('.wrapper').addClass('loader-effect')
                $('#submitSales').off('click')
                if (config.editing) {
                    data = await fetchdata(config.jwt, `/admin/api/orders/${config.editingOrder}`, 'put', JSON.stringify(sales), true)
                } else {
                    data = await fetchdata(config.jwt, `/admin/api/orders/new`, 'post', JSON.stringify(sales), true)

                }
                $('.wrapper').removeClass('loader-effect')

                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    config.lastSales = data.json.sales;
                    return config.resetData()
                }

            }

        },
        resetData: function () {
            config.choosenitems = []
            config.onSetItem = null
            config.selectedcustomer = null
            config.selectedarea = null
            config.deliveryDate = null
            config.editingOrder = null
            config.editing = false
            $('#phone').val('')
            $('#email').val('')
            $('#apartment').val('')
            $('#floor').val('')
            $('#street').val('')
            $('#deliveryDate').val('')
            $('#description').val('')
            $('input[data-list]').val('')
            $('#choosenitems').empty().append('<h3>Selected Item</h3><span>No Items...</span>')
            config.calcPrice()
        },
    }
    config.init()
})()




