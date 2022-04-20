/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/

(function () {
    const expenses = {
        allExpenses: [],
        jwt: $('input[name="_csrf"]').val(),
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        opened: null,
        searchDateType: 'date',
        detectingScan: false,
        companysuppliers: [],
        expensesDate: moment().format('YYYY-MM-DD'),
        init: function () {
            this.cashDom()
            this.bindEvents()
            const from = moment().startOf('month').format('YYYY-MM-DD')
            const to = moment().endOf('month').format('YYYY-MM-DD')
            this.getExpenses({ from: this.from, to: this.to, type: this.searchDateType }, 'date')
            this.getPickers()
            // this.getsuppliers()
        },
        cashDom: function () {

            this.$togglecreateItembox = $('.toggle-new-item')

            this.$expensesForm = $('.save-expenses')
            this.$expensestypebox = $('.new-expenses-type')

            this.$searchname = $('#search-name')
            this.$searchstatus = $('#search-status')
            this.$groupPaidExpenses = $('.paid-expenses')
            this.$groupSchudledExpenses = $('.schedule-expenses')
        },
        bindEvents: function () {

            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            $('body').on('change', '#search-date-type', this.dateType.bind(this))

            this.$searchname.on('keyup', this.searchShipmentNo.bind(this))
            this.$searchstatus.on('change', this.searchShipmentStatus.bind(this))
            $('body').on('click', '.create-excel', this.createExcel.bind(this))

            this.$expensestypebox.on('click', function () { $('.expenses-type-box').toggleClass('none') })

            $('body').on('click', '.edit-item', this.editItem.bind(this))
            $('.new-item-box form').on('submit', this.saveItem.bind(this))

            this.$groupPaidExpenses.on('click', expenses.groupItemsByPaidState.bind(this))
            this.$groupSchudledExpenses.on('click', expenses.groupItemsBySchduledExpenses.bind(this))
            $('.get-insight').on('click', function (e) {
                const itemsDetails = expenses.getExpensesDetails()
                expenses.renderExpensesInsights(itemsDetails)
            })

            $('body').on('click', '.content-item', this.openItem.bind(this))


            $('body').on('click', '.sort-date', this.sortByDate.bind(this))
            $('body').on('click', '.filter', this.filterShipments.bind(this))


            $('body').on('click', '.getInvoice', this.expensesInvoice.bind(this))
            $('body').on('click', '.changePaidState', this.changePaidState.bind(this))
            $('body').on('click', '.delete-item', this.removeExpenses.bind(this))
            $('body').on('click', '.close-insight', this.closeInsights.bind(this))


            $('body').on('click', '.close-single-item', this.closeSingleItem.bind(this))

        },
        togglecreateItembox: function (e) {
            console.log(e);
            $('.new-item-box').toggleClass('slide')
            this.resetData()
        },
        renderExpensesCustomTypes: function (e) {
            $('.filter-type_custom .filter-type-item').remove()
            this.company.data.expensesTypes.forEach(t => {
                $('.filter-type_custom').prepend(`
                    <div class="form-check filter-type-item bg-lightgray ">
                    <input class="form-check-input" type="radio" name="type" id="${t}" value="${t}">
                    <label class="form-check-label" for="${t}">${t}</label>
                    <i class="fas fa-trash font-xs c-r delete-custom-type"></i>
                    </div>
                `)
                $('#expensesType').append(`
                <option value="${t}">${t}</option>
                `)
            })

            $('.filter-type_custom .loading').removeClass('block')

        },

        getsuppliers: async function () {
            const data = await mkreqs(this.jwt, `http://localhost:3000/company/suppliers`, 'get', {}, true)
            if (data != null) {
                expenses.rendersuppliers(data.json.suppliers)
                return expenses.companysuppliers = data.json.suppliers
            }
        },
        rendersuppliers: function (suppliers) {
            suppliers.forEach(v => { $('.suppliers select').append(`<option data-id=${v._id}>${v.name}</option>`) })
        },
        getPickers: () => {
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
                expenses.from = picker.startDate.format('YYYY-MM-DD')
                expenses.to = picker.endDate.format('YYYY-MM-DD')
                expenses.getExpenses({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD'), type: expenses.searchDateType }, 'date')
                cb(picker.startDate, picker.endDate);

            });
        },

        getDueDate: () => {
            const start = moment()
            function callback(start) { $('#dueDate span').html(start.format('MMMM D, YYYY')) }
            $('#dueDate').daterangepicker({
                startDate: new Date(),
                singleDatePicker: true,
                minYear: 2020,
                showDropdowns: true,
                maxYear: 2050

            }, callback);
            // callback(start);
            $('#dueDate').on('apply.daterangepicker', function (ev, picker) {
                callback(picker.startDate);
                expenses.duoDate = picker.startDate.format('YYYY-MM-DD')
            });
        },

        getExpenses: async function (query, searchType) {
            console.log(query);
            console.log(searchType);
            $('.content .loading').removeClass('none')
            const url = this.getQueryUrl(query, searchType)
            const data = await fetchdata(this.jwt, url, 'get', {}, true)
            $('.content .loading').addClass('none')
            if (data != null) {
                this.renderExpenses(data.json.bills)
                this.allItems = data.json.bills
                return data.json.bills
            }
        },
        dateType: function (e) { this.searchDateType = $(e.target).val() },
        searchShipmentNo: function (e) { this.getExpenses({ no: e.target.value }, 'serial') },
        searchShipmentStatus: function (e) { this.getExpenses({ category: $(e.target).val() }, 'category') },
        getQueryUrl: (query, searchType) => {
            switch (searchType) {
                case 'date':
                    return `/admin/api/bills?from=${query.from}&&to=${query.to}&&type=${query.type}`
                case 'serial':
                    return `/admin/api/bills?no=${query.no}`
                case 'category':
                    return `/admin/api/bills?category=${query.category}`
                case 'id':
                    return `/admin/api/bills?id=${query.id}`
                default:
                    return `/admin/api/bills`
            }
        },
        createExcel: function (e) {
            e.preventDefault()
            let items = this.filterForExcel(this.allItems)
            this.exportReport(items)
        },
        filterForExcel: function (items) {
            const shipments = items.map((s) => ({ date: s.date, shipmentNo: s.shipmentNo, price: s.price, stauts: s.status.text, note: s.status.reason ? s.status.reason : s.status.note, driver: s.driver.name }))
            return shipments
        },
        exportReport: function (json) {
            const fields = Object.keys(json[0]);

            const replacer = function (key, value) { return value === null ? '' : value };
            let csv = json.map(function (row) { return '\r\n' + fields.map(function (fieldName) { return JSON.stringify(row[fieldName], replacer) }) });
            csv.unshift(fields.join(','))  // add header column
            csv = 'sep=,\r\n' + csv.join(',');


            window.URL = window.URL || window.webkiURL;

            let blob = new Blob([csv], { type: 'text/csv' });
            const csvUrl = window.URL.createObjectURL(blob);
            const filename = `report.csv`;

            $(".download-sheet").attr({ 'download': filename, 'href': csvUrl })
            // $('.download-sheet').trigger('click')
            $(".download-sheet").removeClass('none')
        },
        // sortExpenses: function (expenses) {
        //     let sorted = []
        //     bubbleSort(expenses)
        //     function bubbleSort(arr) {
        //         var noSwaps;
        //         for (var i = arr.length; i > 0; i--) {
        //             noSwaps = true
        //             for (var j = 0; j < i - 1; j++) {
        //                 if (arr[j].total > arr[j + 1].total) {
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
        //     // expenses.renderSales(sorted)
        // },
        sortByDate: function (e) {
            let sorted = []
            bubbleSort(expenses.allItems)
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

                expenses.renderExpenses(sorted.reverse())
            } else {
                expenses.renderExpenses(sorted)

            }
            return sorted
        },
        filterShipments: function (e) {
            let filterType = $(e.target).data('status')
            let items = this.allItems.filter(s => s.status.no === filterType)
            this.renderExpenses(items)

        },
        checkRequirements: function () {
            if (expenses.expensesType == null) {
                showmessage('Choose Expenses Type', 'info', 'body')
                return false
            }
            if (!expenses.expensesAmount < 0 ||
                !expenses.expensesQuantity < 0) {
                showmessage('Numbers must be positive', 'info', 'body')
                return false
            }
            if (expenses.scheduleState) {
                if (expenses.duoDate == null) {
                    showmessage('Choose Duo Date', 'info', 'body')
                    return false
                }
            }
            // if (!expenses.expensesAmount.replace(/\s/g, '').length || !expenses.expensesQuantity.replace(/\s/g, '').length) { return showmessage('All stared <span class="c-r">"*"</span> fields required', 'info', 'body') }
            if (expenses.supplierState) {
                if (expenses.supplier == null || expenses.supplier == 'null') {
                    showmessage('Choose Supplier', 'info', 'body')
                    return false
                }
            }
            return true
        },
        editItem: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = this.allItems.find(c => c._id.toString() == itemId.toString())
            this.opened = item._id
            this.editing = true

            $('#amount').val(item.amount);
            $('#category').trigger('change').val(item.category)
            $('#billType').trigger('change').val(item.billtype)

            $('#date').trigger('change').val(item.release_date)
            $('#due').trigger('change').val(item.due)

            document.getElementById('paid').checked = item.status.paid
            $('#notes').val(item.notes)
            $('.new-item-box').addClass('slide')

        },
        resetData: function (e) {
            document.getElementById('paid').checked = false

            $('#billType').trigger('change').val('out');
            $('#category').trigger('change').val('rent');
            $('#date').val('')
            $('#due').val('')
            $('#amount').val(0)
            $('#notes').val('')

            expenses.editing = false
        },

        createItemForm: function () {
            const billtype = $('#billType').val();
            const category = $('#category').val();
            const date = $('#date').val()
            const due = $('#due').val()
            const amount = $('#amount').val()
            const notes = $('#notes').val()
            const paid = document.getElementById('paid').checked
            if (!due.replace(/\s/g, '').length || !date.replace(/\s/g, '').length | !amount) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            } else {
                let formData = new FormData();
                formData.append("billtype", billtype)
                formData.append("category", category)
                formData.append("date", date)
                formData.append("due", due)
                formData.append("amount", amount)
                formData.append("paid", paid)
                formData.append("notes", notes)
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
                    data = await fetchdata(this.jwt, `/admin/api/bills/${this.opened}`, 'put', newform, false)

                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                } else {
                    data = await fetchdata(this.jwt, '/admin/api/bills', 'post', newform, false)

                }
                $('.new-item-box').removeClass('loader-effect')
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    if (this.editing) {
                        this.updateItem(data.json.vehicle)
                        this.togglecreateItembox()
                        createSingleItem(data.json.vehicle)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {
                        this.allItems.push(data.json.vehicle)
                        this.togglecreateItembox()
                    }
                    this.updateItemElm(data.json.vehicle)

                    this.resetData()
                }
            }
        },
        renderExpenses: function (allItems) {
            $('.content-item').remove()
            removeFullBack()

            if (allItems.length === 0) return $("main .content").prepend(emptycontent())
            console.log('here');
            allItems.forEach(s => $('.content .items').append(createitemBox(s)))
            expenses.getExpensesSummary(allItems)
        },

        getItemObeject: function (e) {
            const itemId = findItemId('itemId', e)
            const item = expenses.filterSingleItem(itemId)
            return item
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
        closeSingleItem: function () {
            $('.single-item').removeClass('scale')
        },

        expensesInvoice: function (e) {
            e.stopPropagation()
            const expensesId = findItemId('expensesId', e)
            const fetchedexpenses = this.filterSingleExpenses(expensesId)
            this.renderInvoice(fetchedexpenses)
        },
        renderInvoice: function (e) {
            createInvoiceClass('expenses', '.invoice-wrapper', e)
            $('.close-invoice').on('click', function (e) { $("#invoice").remove() })
        },
        confirmAssigned: async function (e) {
            const expensesId = $(e.target).parent('.employee').find('input[name="expensesId"]').val()
            const employeeName = $(e.target).parents('.employee').find('input[name="employeeName"]').val()
            const employeeId = $(e.target).parent('.employee').find('input[name="employeeId"]').val()

            $(e.target).find('.loading').css({ display: "block" })
            const rawResponse = await fetch(`/expenses/assign?expensesId=${expensesId}&&employeeId=${employeeId}`, {
                method: 'POST',
                headers: {
                    Authorization: "Bearer " + expenses.jwt,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expensesType: expenses.expensesType, paidOn: expenses.scheduleDate, amount: expenses.expensesAmount, quantity: expenses.expensesQuantity, paidBy: expenses.paidBy, describtion: expenses.expensesDescribtion, approved: expenses.paid })
            });
            if (rawResponse.status === 200) {
                $(`input[value=${expensesId}]`).parents('.content-item').find('.AssignedTo').html('Assigned To:' + employeeName)
            }
            const res = await rawResponse.json()
            showmessage(res.message, res.messageType, 'body')
            $(e.target).find('.loading').css({ display: "none" })
        },
        changePaidState: async function (e) {
            $('.single-item').addClass('loader-effect')
            const expensesId = findItemId('expensesId', e)
            const paidState = true
            $(e.target).find('.loading').css({ display: "block" })
            const data = await mkreqs(this.jwt, `http://localhost:3000/expenses/paid?expensesId=${expensesId}&&paidState=${paidState}`, 'post', JSON.stringify({}), true);
            if (data != null) {
                $(`input[value=${expensesId}]`).parents('.content-item').find('.paidstatuse').removeClass('alert-danger').addClass('alert-success').find('span').attr('tooltip', 'Paid')
                $(`input[value=${expensesId}]`).parents('.content-item').find('.expenses-group_item-submenu').removeClass('activeMenu')
                showmessage('Changed To Paid', data.json.messageType, 'body')
                $(e.target).remove()
            }
            $(e.target).find('.loading').css({ display: "none" })
            $('.single-item').removeClass('loader-effect')

        },
        removeExpenses: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Driver?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/bills/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()
                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleItem()
                        showmessage('Bill Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
        getExpensesSummary: function (expenses) {

            const expensesPaidFor = {}
            expenses.forEach(e => {
                expensesPaidFor[e.type] = (expensesPaidFor[e.type] || e.amount) + e.amount
            })
            let arr1 = Object.values(expensesPaidFor);
            let max = Math.max(...arr1);
            function getKeyByValue(expensesPaidFor, max) {
                return Object.keys(expensesPaidFor).find(key => expensesPaidFor[key] === max);
            }
            const mostPaidFor = getKeyByValue(expensesPaidFor, max)
            this.renderSummary(expensesPaidFor)
        },
        renderSummary: function (expensesPaidFor) {
            $('#operations-summary').empty()
            for (const key in expensesPaidFor) {
                $('#operations-summary').append(`
                    <span class="btn-small">
                    ${key}
                    $${expensesPaidFor[key]}
                    </span>
                `)
            }
        },

        getsupplierState: function (e) {
            expenses.supplierState = $(e.target).prop('checked')
            if (expenses.supplierState) {
                $('.suppliers').removeClass('none')
            } else {
                $('.suppliers').addClass('none')
                expenses.supplier = null

            }
        },
        openSupplierInput: function (e) { $('.supplier-info').toggleClass('none') },
        getsupplier: function (e) {
            const supplierId = $('option:selected', $(e.target)).data("id")

            if (supplierId == null) {
                return expenses.supplier = null
            } else {
                expenses.supplier = {
                    id: supplierId,
                    name: expenses.companysuppliers.find(v => v._id.toString() == supplierId.toString()).name,
                    mobile: expenses.companysuppliers.find(v => v._id.toString() == supplierId.toString()).mobile
                }
            }

        },
        savesupplier: async function (e) {
            const supplierName = $(e.target).parents('.supplier-info').find('input[name="supplierName"]').val()
            const supplierMobile = $(e.target).parents('.supplier-info').find('input[name="supplierMobile"]').val()
            const supplierAddress = $(e.target).parents('.supplier-info').find('input[name="supplierAddress"]').val()
            const supplierEmail = $(e.target).parents('.supplier-info').find('input[name="supplierEmail"]').val()

            if (supplierName === '' || supplierMobile === '' || supplierAddress === '' || supplierEmail === '') return showmessage('Add supplier full info ', 'info', 'body')
            const data = await mkreqs(this.jwt, '/company/suppliers', "post", JSON.stringify({ name: supplierName, mobile: supplierMobile, email: supplierEmail, address: supplierAddress }), true)
            if (data != null) {
                expenses.companysuppliers.push(res.supplier)
                expenses.rendersuppliers(rawResponse.companysuppliers)
                $('.supplier-info').toggleClass('scale')
                showmessage(res.message, res.messageType, 'body')
            }
        },

        getExpensesDetails: function () {
            const allExpenses = expenses.allExpenses
            const expensesPaidBy = {}
            const expensesPaidFor = {}

            allExpenses.forEach(e => {
                expensesPaidBy[e.status.paidBy] = (expensesPaidBy[e.status.paidBy] || 0) + 1
                expensesPaidFor[e.for] = (expensesPaidFor[e.for] || e.total) + e.total

            })

            let arr1 = Object.values(expensesPaidFor);
            let max1 = Math.max(...arr1);
            let arr2 = Object.values(expensesPaidBy);
            let max2 = Math.max(...arr2);
            function getMaxVal(item, max) { return Object.keys(item).find(key => item[key] === max); }
            const mostPaidFor = getMaxVal(expensesPaidFor, max1)
            const mostPaidBy = getMaxVal(expensesPaidBy, max2)

            return { mostPaidBy, expensesPaidBy, mostPaidFor, expensesPaidFor }
        },
        renderExpensesInsights: function (expensesInsights) {
            $('.insight-items_item').remove()

            $('.insight_content .form-actions').empty().append(`
                  <span class="gradient-green border-r-s c-w p-3">MOST PAYING By <b>${expensesInsights.mostPaidBy}</b></span>
                  <span class="gradient-blue border-r-s c-w p-3">HIEGEST PAYING GOSE FOR <b>${expensesInsights.mostPaidFor}</b></span>
            `)
            for (const key in expensesInsights.expensesPaidBy) {
                $('.insight_content .insight-items.numbers').append(
                    `
                     <div class="insight-items_item">
                        <h5>USER NAME: ${key}</h5>
                        <span>PAYMENTS: <b>${expensesInsights.expensesPaidBy[key]}</b> Times</span>
                     </div>   
                    `
                )
            }
            for (const key in expensesInsights.expensesPaidFor) {

                $('.insight_content .insight-items.revenue').append(
                    `
                         <div class="insight-items_item">
                            <h5>Item Name/Code: ${key}</h5>
                            <span>AMOUNT: <b>${expensesInsights.expensesPaidFor[key]}$</b></span>
                         </div>   
                        `
                )
            }

            $('.insight_content').addClass('scale')
        },
        closeInsights: function () {
            $('.insight-items_item').remove()
            $('.insight_content').removeClass('scale')
        },

        groupItemsByPaidState: function () {
            const allExpenses = expenses.allExpenses

            let paid = {}
            allExpenses.forEach(e => {
                if (paid[e.status.paid]) {
                    paid[e.status.paid].push(e)
                } else {
                    paid[e.status.paid] = []
                    paid[e.status.paid].push(e)
                }

            })
            expenses.renderExpensesGroups(paid, 'paid')

        },
        groupItemsBySchduledExpenses: function () {
            const allExpenses = expenses.allExpenses

            let scheduled = {}
            allExpenses.forEach(e => {

                if (scheduled[e.scheduled.state]) {
                    scheduled[e.scheduled.state].push(e)
                } else {
                    scheduled[e.scheduled.state] = []
                    scheduled[e.scheduled.state].push(e)
                }

            })
            expenses.renderExpensesGroups(scheduled, 'scheduled')
        },
        renderExpensesGroups(allExpenses, state) {
            const today = [moment().format('YYYY-MM-DD')]
            $('.group-items').remove()
            $('.content-item').remove()
            for (const key in allExpenses) {
                $('.content').append(`  
                    <div class="group-items grid bg-darkgray" data-key="${key}">
                        <h3 class="f-center">${state == 'scheduled' ? key == 'true' ? 'Scheduled' : 'Not Scheduled' : key == 'true' ? 'Paid' : 'Not Paid'}</h3>
                        <div class="items"></div>
                    </div>
                `)
                allExpenses[key].forEach(e => {
                    $(`[data-key='${key}']`).find('.items').append(`
                    <div class="content-item">
                    <input type="hidden" value="${e._id}" name="expensesId">
                        <div class="flex f-space-between">
                            <span class="font-xs">${e.date}</span>
                            <i class="fas fa-ellipsis-v  sub-menu_btn"></i>
                            <ul class="sub-menu">
                                <li class="sub-menu_item getInvoice">Invoice <i class="fas fa-file"></i></li>
                                <li class="sub-menu_item assignTo">Assign to <i class="fas fa-angle-double-right"></i></li>
                                ${e.status.paid ? '' : "<li class='sub-menu_item changePaidState'>Paid</li>"}
                                <li class="deleteExpenses">Remove <i class="fas fa-trash"></i></li>
                            </ul>
                        </div>
                        <p class="total">$ <b>${e.total}</b></p>
                        <div class="expenses-group_item_body">
                            <p class="AssignedTo">Assigned To: ${e.assignedTo != null ? e.assignedTo.name : 'No One..'}</p>
                            <p class="paidState" style="${e.status.paid ? 'color:green;' : 'color:red;'}"></p>
                            <div class="marked paidstatuse block ${e.status.paid ? 'alert-success' : 'alert-danger'}" style="right:70px">
                                <span tooltip="${e.status.paid ? `Paid by ${e.status.paidBy}` : 'Not Paid '}" flow="left"><i class="far fa-check-circle"></i></span>
                            </div>
                          
                            <div class="marked ${e.scheduled.state ? 'block' : ''}  ${e.scheduled.date < today ? 'alert-error' : e.scheduled.date == today ? 'alert-warning' : 'alert-info'}">
                                <span tooltip="Paid On ${e.scheduled.date}" flow="left"><i class="fa fa-calendar"></i></span>
                            </div>
                        </div>
                    </div>
                    `)

                })
            }


        },

    }
    expenses.init()
})()