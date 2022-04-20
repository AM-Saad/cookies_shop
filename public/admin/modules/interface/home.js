
/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/

(function () {
    const mainpanel = {

        jwt: localStorage.getItem('token'),
        choosenCompanyResult: '',
        detectingScan: false,
        fetchedExpenses: [],
        fetchedSales: [],
        init: async function () {
            this.cashDom()
            this.bindEvents()
            const from = moment().startOf('month').format('YYYY-MM-DD')
            const to = moment().endOf('month').format('YYYY-MM-DD')
            const lastMonthFrom = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
            const lastMonthTo = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')

            const thisMonthSales = await this.searchSalesByDate(from, to)
            const lastMonthSales = await this.searchSalesByDate(lastMonthFrom, lastMonthTo)

            // const thisMonthExpenses = await this.searchExpensesByDate(from, to)
            // const lastMonthExpenses = await this.searchExpensesByDate(lastMonthFrom, lastMonthTo)

            this.comparisonBetweenTowMonthes(thisMonthSales, lastMonthSales)
        },
        cashDom: function () {
            $('body').on('click', '.order', this.storeShipment.bind(this))

        },
        bindEvents: function () {
        },
        showMessage: function (message, messageType, selector) {

            $(selector).prepend(`
            <p class="message alert alert-${messageType}">${message}</p>
            `)
            $('.message').animate({ top: '80px' }, 300)
            setTimeout(function () {
                $('.message').animate({ top: '0' }, 200, function () {
                    $(this).remove()
                })
            }, 5000);

        },
        storeShipment: function (e) {
            e.preventDefault()
            console.log(e);
            const siD = $(e.target).data('si')
            localStorage.setItem('si', siD)
            return window.location.href = e.currentTarget.href
        },

        searchSalesByDate: async (from, to) => {

            const data = await fetchdata(mainpanel.jwt, `/admin/api/orders/?from=${from}&&to=${to}&&type=date`, 'get', {}, true)
            console.log(data);
            if (data) {
                mainpanel.fetchedSales = data.json.orders
                return data.json.orders
            }
            return mainpanel.showMessage(res.message, res.messageType, 'body')




        },
        searchExpensesByDate: async (from, to) => {

            try {
                const res = await fetch(`/expenses/date/?from=${from}&&to=${to}`, {
                    headers: {
                        Authorization: "Bearer " + mainpanel.jwt
                    }
                })
                if (res.status != 200) {
                    return mainpanel.showMessage(res.message, res.messageType, 'body')
                } else {
                    const response = await res.json()
                    return response.expenses

                }
            } catch (error) {
                return mainpanel.showMessage('Something went wrong, please try again..', 'error', 'body')

            }

        },

        makeDailySalesFilterations: function (sales) {
            const salesPerDay = {}
            const revenuePerDay = {}
            const sources = {}
            const sellers = {}
            //get excat number of day in month
            function myDate(date) {
                const newDate = new Date(date)
                return newDate.getDate()
            }
            sales.forEach(s => {
                salesPerDay[s.date] = (salesPerDay[s.date] || 0) + 1
                revenuePerDay[s.date] = (revenuePerDay[s.date] || 0) + s.totalPrice
                sources[s.leadSource] = (sources[s.leadSource] || 0) + 1
            })
            return { salesPerDay, revenuePerDay, sources, sellers }

        },
        comparisonBetweenTowMonthes: function (thisMonth, lastMonth, thisMonthExpenses, lastMonthExpenses) {

            // const thisMonthFilterations = this.makeDailySalesFilterations(thisMonth)
            // const lastMonthFilterations = this.makeDailySalesFilterations(lastMonth)
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            let lastMonthSalesLength = 0
            let lastMonthRevenue = 0

            let thisMonthRevenue = 0

            let percentageOfSales
            let percentageOfRevenue

            // if (thisMonth.length > 0) {

            const lastSalesThisMonth = thisMonth.length - 1

            const dateOfLastSales = this.getDate(thisMonth[lastSalesThisMonth].date)

            //get last month sales until same day as today

            lastMonth.forEach(s => {
                if (this.getDate(s.date) <= dateOfLastSales) {
                    lastMonthSalesLength += 1
                    lastMonthRevenue += s.totalPrice
                }
            })

            thisMonth.forEach(s => thisMonthRevenue += s.totalPrice)

            if (lastMonthSalesLength < thisMonth.length) {
                percentageOfSales = 100 - ((lastMonthSalesLength / thisMonth.length) * 100)
            } else {
                percentageOfSales = 100 - ((thisMonth.length / lastMonthSalesLength) * 100)
            }

            if (lastMonthRevenue < thisMonthRevenue) {
                percentageOfRevenue = 100 - ((lastMonthRevenue / thisMonthRevenue) * 100)
            } else {
                percentageOfRevenue = 100 - ((thisMonthRevenue / lastMonthRevenue) * 100)
            }

            // }
            const salesPercentageFloor = Math.floor(percentageOfSales)
            const revenuePercentageFloor = Math.floor(percentageOfRevenue)
            $('.over-all-review').append(
                `
                <div class="over-all-review_compare_percentage ">
                <div class="over-all-review_compare_percentage_item ">
                <div>
                    <p>الطلبات حتي <b>${dateOfLastSales}/${months[this.getMonth(thisMonth[0].date)]}</b><br><b>${thisMonth.length}</b> طلبات
                    <span style="font-size:13px; font-weight:lighter">مقارنه بـ الشهر الماضي ${lastMonth.length === 0 ? '<b>صفر</b>' : lastMonth.length} طلبات</p>
                </div>
                <div class="item_percentage">
                    ${lastMonthSalesLength < thisMonth.length ? `<p style="color:#00f800"><b>%</b>${salesPercentageFloor} <i class="fas fa-arrow-up"></i></p>` : `<p style="color:red"><b>%</b>${salesPercentageFloor} <i class="fas fa-arrow-down"></i></p>`}
                </div>
                </div>
                <div class="over-all-review_compare_percentage_item p-medium border-1 border-r-m m-b-3">
                    <div>
                        <p>العائدات حتي <b>${dateOfLastSales}/${months[this.getMonth(thisMonth[0].date)]}</b><br>$${thisMonthRevenue}
                        <span style="font-size:13px; font-weight:lighter">مقارنه بـ الشهر الماضي ${lastMonthRevenue === 0 ? 'صفر' : lastMonthRevenue} $</p>

                    </div>
                    <div class="item_percentage">
                    ${lastMonthRevenue < thisMonthRevenue ? `<p style="color:#00f800"><b>%</b>${revenuePercentageFloor} <i class="fas fa-arrow-up"></i></p>` : `<p style="color:red"><b>%</b>${revenuePercentageFloor} <i class="fas fa-arrow-down"></i></p>`}
                </div>
                </div>
           
                </div>
    
                `

            )




            $('.over-all-review').find('.loading').addClass('none')

        },
        getMonth: function (date) {
            const newDate = new Date(date)
            return newDate.getMonth()
        },
        getDate: function (date) {
            const newDate = new Date(date)
            return newDate.getDate()
        }
    }
    mainpanel.init()
})()


