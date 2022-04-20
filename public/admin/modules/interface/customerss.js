/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allItems: [],
        openedOrders: [],
        userImg: null,
        startMonth: moment().startOf('month').format('YYYY-MM-DD'),
        endMonth: moment().endOf('month').format('YYYY-MM-DD'),
        opened: null,
        searchDateType: 'date',
        editing: false,
        filter: [],
        init: async function () {
            this.cashDom()
            this.bindEvents()
            this.getItem()
            this.getPicker()

        },
        cashDom: function () {

            this.$togglecreateItembox = $('.toggle-new-item')
            this.$userImg = $('.driverImage')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {

            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            this.$userImg.on('change', this.getUserImg.bind(this))
            this.$searchname.on('keyup', this.searchDriverName.bind(this))


            $('body').on('click', '.content-item', this.openItem.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleItem.bind(this))
            $('body').on('click', '.customer-orders .order', this.openOrderBox.bind(this))
            $('body').on('click', '.close-orders', this.closeOrders.bind(this))

            $('.new-item-box form').on('submit', this.saveItem.bind(this))

            $('body').on('click', '.edit-item', this.editItem.bind(this))

            $('body').on('click', '.delete-item', this.deleteItem.bind(this))

            $('body').on('click', '.customer-orders-box', this.openOrderssBox.bind(this))
            $('body').on('click', '.sort-date', this.sortShipmentsByDate.bind(this))
            $('body').on('click', '.filter-items', this.filterItems.bind(this))

            $('body').on('change', '#search-date-type', this.dateType.bind(this))

            $('body').on('click', '.filter', this.filterOrders.bind(this))
            $('body').on('change', '#search-name', this.searchOrderNo.bind(this))
            $('body').on('change', '#search-status', this.searchOrderStatus.bind(this))
        },

        getPicker: function (e) {
            const start = moment()
            const end = moment()
            function cb(start, end) {
                $('#reportrange span').html(start.format('MMMM D, YYYY') + " - " + end.format('MMMM D, YYYY'));
                $('.sorting h4').html(start.format('MMMM D, YYYY') + " - " + end.format('MMMM D, YYYY'));
            }
            cb(start, end);

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
                config.from = picker.startDate.format('YYYY-MM-DD')
                config.to = picker.endDate.format('YYYY-MM-DD')
                config.getOrders({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD'), type: config.searchDateType }, 'date')
                cb(picker.startDate, picker.endDate);

            });
        },
        getItem: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/customers', 'get', {}, true)
            if (data != null) {
                $('.content .loading').addClass('none')
                this.renderItems(data.json.customers)

                return this.allItems = data.json.customers
            }
        },
        searchDriverName: function (e) {
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
            const dirver = config.filterSingleItem(itemId)
            return dirver
        },

        filterSingleItem: function (itemId) {
            const item = this.allItems.find(c => { return c._id.toString() === itemId.toString() })
            return item
        },
        openItem: function (e) {
            const item = this.getItemObeject(e)
            this.opened = item._id
            return createSingleItem(item)

        },
        closeDriver: (e) => {
            $('.single-item').remove()
        },
        togglecreateItembox: function (e) {
            console.log('here');
            $('.new-item-box').toggleClass('slide')
            if ($('.new-item-box').hasClass('slide')) $('#itemName').focus()
            this.resetData()

        },
        getUserImg: function (e) {
            let photo = e.target.files[0];  // file from input
            config.userImg = photo

            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('.item-preview_image').attr('src', e.target.result);
                }
                reader.readAsDataURL(e.target.files[0]);
            }
            $('.item-preview_image').animate({ opacity: 1 }, 300)
            console.log(config.userImg);

        },
        createItemForm: function () {
            const name = $('#itemName').val();
            const mobile = $('#itemNumber').val()
            const address = $('#itemAddress').val()
            const email = $('#itemEmail').val()
            const baseSalary = $('#baseSalary').val()
            const commission = $('#commission').val()
            const notes = $('#newitemnotes').val()
            if (!name.replace(/\s/g, '').length || !mobile.replace(/\s/g, '').length) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            } else {
                let formData = new FormData();
                formData.append("name", name)
                formData.append("mobile", mobile)
                formData.append("address", address)
                formData.append("email", email)
                formData.append("notes", notes)
                formData.append("baseSalary", baseSalary)
                formData.append("commission", commission)
                formData.append("image", config.userImg)
                return formData
            }
        },
        saveItem: async function (e) {
            e.preventDefault()
            const newform = this.createItemForm()
            if (newform != false) {
                $('.new-item-box').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/customers/${this.opened}`, 'put', newform, false)
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/customers', 'post', newform, false)
                }
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    $('.new-item-box').removeClass('loader-effect')

                    if (this.editing) {
                        this.updateItem(data.json.customer)
                        this.togglecreateItembox()
                        createSingleItem(data.json.customer)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {
                        this.allItems.push(data.json.customer)
                        this.togglecreateItembox()
                    }
                    this.updateItemElm(data.json.customer)

                    this.resetData()
                }

            }

        },
        resetData: function (e) {
            $('input[name="newitemname"]').val('');
            $('input[name="newitemmobile"]').val('')
            $('input[name="newitemaddress"]').val('')
            $('input[name="newitememail"]').val('')
            $('input[name="newitemnotes"]').val('')
            $('#baseSalary').val('')
            $('#commission').val('')
            config.userImg = null
            config.editing = false
        },
        editItem: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = this.allItems.find(c => c._id.toString() == itemId.toString())
            this.opened = item._id
            this.editing = true
            console.log('hheee');
            $('#itemName').val(item.name);
            $('#itemNumber').val(item.mobile)
            $('#itemAddress').val(item.address)
            $('#itemEmail').val(item.email)
            $('#newitemnotes').val(item.note)

            $('.new-item-box').addClass('slide')

        },


        renderItems: function (allItems) {
            $('.content-item').remove()
            removeFullBack()
            if (allItems.length === 0) return $("main .content").prepend(emptycontent())
            allItems.forEach(s => $('.content').append(createitemBox(s)))
        },


        closeSingleItem: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },

        deleteItem: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Item?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/customers/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()
                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleItem()
                        showmessage('Customer Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
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
        openOrderssBox: function (e) {
            this.opened = findItemId('itemId', e)
            console.log(this.opened);
            $('.customer-orders .order').remove()
            $('.customer-orders').addClass('slide')
        },
        getItemsShipments: async function (e) {

            // $('.customer-orders .loading').addClass('block')
            const data = await fetchdata(this.jwt, `/admin/api/customer/orders/${config.opened}`, 'get', {}, true)
            if (data != null) {
                const orders = data.json.orders
                config.openedOrders = orders
                config.renderOrders(orders)
            }

        },
        getOrders: async function (query, searchType) {
            $('.customer-orders').addClass('loader-effect')

            const url = this.getQueryUrl(query, searchType)
            const data = await fetchdata(this.jwt, url, 'get', {}, true)
            $('.customer-orders').removeClass('loader-effect')
            if (data != null) {
                this.renderOrders(data.json.orders)
                this.openedOrders = data.json.orders
                return data.json.orders
            }

        },
        dateType: function (e) { this.searchDateType = $(e.target).val() },
        searchOrderNo: function (e) { this.getOrders({ no: e.target.value }, 'serial') },
        searchOrderStatus: function (e) {
            console.log('hhe');
            this.getOrders({ status: $(e.target).val() }, 'status')
        },
        getQueryUrl: (query, searchType) => {
            switch (searchType) {
                case 'date':
                    return `/admin/api/customers/orders/${config.opened}?from=${query.from}&&to=${query.to}&&type=${query.type}`
                case 'serial':
                    return `/admin/api/customers/orders/${config.opened}?no=${query.no}`
                case 'status':
                    return `/admin/api/customers/orders/${config.opened}?status=${query.status}`
                case 'id':
                    return `/admin/api/customers/orders/${config.opened}?id=${query.id}`
                default:
                    return `/admin/api/customers/orders/${config.opened}`
            }
        },
        filterItems: function (e) {
            const filterType = $(e.target).data('filter')
            const filterVal = $(e.target).data('val')

            let sorted = this.bubbleSort(this.allItems)

            this.filter.push({ name: filterType, items: sorted })
            console.log(this.filter);
            if (filterVal == 'low') {
                this.renderItems(sorted)
            } else {
                this.renderItems(sorted.reverse())
            }
        },
        bubbleSort: function (arr, sortType) {
            let sorted = []
            var noSwaps;
            for (var i = arr.length; i > 0; i--) {
                noSwaps = true
                for (var j = 0; j < i - 1; j++) {
                    if (arr[j].orders.length > arr[j + 1].orders.length) {
                        var temp = arr[j]
                        arr[j] = arr[j + 1]
                        arr[j + 1] = temp
                        noSwaps = false
                    }
                }
                if (noSwaps) break;
            }
            return sorted = arr
        },
        renderOrders: function (orders) {
            $('.order').remove()
            $('.contentFallBack').remove()
            let totalAmount = 0
            if (orders.length === 0) return $('.customer-orders .inside-wrapper').append(`<div class="contentFallBack"><h2>No result to display</h2></div>`)
            const driver = this.filterSingleItem(config.opened)
            console.log(driver);
            orders.forEach(o => {
                totalAmount += o.totalPrice
                orderItem(o)
            })
            $('.customer-orders .totals').empty().append(`
            <span>المجموع : <b>${Math.floor(totalAmount)}</b></span>
            `)

        },

        sortShipmentsByDate: function (e) {
            let sorted = []
            bubbleSort(config.openedOrders)
            function bubbleSort(arr) {
                var noSwaps;
                for (var i = arr.length; i > 0; i--) {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].date > arr[j + 1].date) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                }
                return sorted = arr
            }
            if ($(e.target).hasClass('sort-new')) {

                config.renderOrders(sorted.reverse())
            } else {
                config.renderOrders(sorted)

            }
            return sorted
        },
        filterOrders: function (e) {
            let filterType = $(e.target).data('status')
            let shipments = this.openedOrders.filter(s => s.status.no === filterType)
            this.renderOrders(shipments)

        },
        checkSerial: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
        closeOrders: function (e) {
            console.log('hhe');
            $('.customer-orders').removeClass('slide')
            $('.customer-orders .order').remove()
            config.openedOrders = []
        },
        openOrderBox: function (e) {
            let orderId
            if ($(e.target).hasClass('.order')) {
                orderId = $(e.target).find('input[name="orderId"]').val()
            } else {
                orderId = $(e.target).parents('.order').find('input[name="orderId"]').val()
            }

            const order = config.openedOrders.find(o => { return o.id == orderId })
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



