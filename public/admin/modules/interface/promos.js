/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allItems: [],
        subCategories: [],
        customerImg: null,
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
            this.$customerImg = $('.driverImage')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {
            this.$togglefilters.on('click', this.togglefilters.bind(this))

            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            this.$searchname.on('keyup', this.searchItemName.bind(this))


            $('body').on('click', '.content-item', this.openItem.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleCustomer.bind(this))

            $('.new-item-box form').on('submit', this.saveItem.bind(this))

            $('body').on('click', '.edit-item', this.editItem.bind(this))

            $('body').on('click', '.delete-item', this.deleteItem.bind(this))


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
            const data = await fetchdata(this.jwt, '/admin/api/promos', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderItems(data.json.promos)
                return this.allItems = data.json.promos
            }
        },
        searchItemName: function (e) {
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
            const item = config.filterSingleItem(itemId)
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
            const discount = $('#discount').val();
            const limit = $('#limit').val();
            const active = document.getElementById('active').checked
            console.log(active);
            if (!name.replace(/\s/g, '').length) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            } else {
                let formData = new FormData();
                formData.append("name", name)
                formData.append("discount", discount)
                formData.append("limit", limit)
                formData.append("active", active)

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
                    data = await fetchdata(this.jwt, `/admin/api/promos/${this.opened}`, 'put', newform, false)
                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/promos', 'post', newform, false)
                }
                $('.new-item-box').removeClass('loader-effect')
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    if (this.editing) {
                        this.updateItem(data.json.promo)
                        this.togglecreateItembox()
                        createSingleItem(data.json.promo)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {
                        this.allItems.push(data.json.promo)
                        this.togglecreateItembox()
                    }
                    this.updateItemElm(data.json.promo)

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
            this.editing = true
            $('#name').val(item.name);
            $('#discount').val(item.discount);
            $('#limit').val(item.limit);
            document.getElementById('active').checked = item.active
            $('.new-item-box').addClass('slide')

        },
        resetData: function (e) {
            document.getElementById('active').checked = true
            $('#name').val('');
            $('#limit').val('');
            $('#discount').val('');
            config.editing = false
        },


        renderItems: function (items) {
            $('.content .loading').removeClass('block')
            $('.content-item').remove()
            removeFullBack()

            if (items.length === 0) return $("main .content").prepend(emptycontent())
            items.forEach(s => createitemBox(s))
        },


        closeSingleCustomer: function () {
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
                    const data = await fetchdata(this.jwt, `/admin/api/promos/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleCustomer()
                        showmessage('تم حذف الكود', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
    


 
        checkSerial: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
 


    }
    config.init()
})()



