const StaticCacheName = "cache-v2";
const DynamicCacheName = "dynamic-cache-v2";
const resourcesToPrecache = [
    "/",
    "/fallback.html",
    "/manifest.json",
    "/admin/css/classes.css",
    "/admin/css/main.css",
    "/shop/css/home.css",
    "/shop/css/nav.css",
    "/shop/css/product.css",
    "/shop/css/products.css",
    "/shop/css/details-product.css",
    "/shop/css/cart.css",
    "/shop/css/auth.css",
    "/shop/css/contact.css",
    "/shop/js/main.js",
    "/shop/images/main.jpg",
    "/shop/images/about.png",
    "/shop/images/logo.jpg",
];

//
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
}


self.addEventListener("install", e => {
    console.log("Service Worker has been installed");
    e.waitUntil(
        caches.open(StaticCacheName)
            .then(cache => {
                return cache.addAll(resourcesToPrecache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", e => {
    console.log("Service Worker has been activated");

    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== StaticCacheName && key !== DynamicCacheName)
                    .map(key => caches.delete(key))
            );
        })
    );
});



self.addEventListener("fetch", async e => {
    let { request } = e
    console.log(e.request);
    e.respondWith(
        caches.match(e.request)
            .then(cachedResponse => {

                return (
                    cachedResponse || fetch(e.request)
                        .then(fetchRes => {
                            return caches.open(DynamicCacheName)
                                .then(cache => {
                                    // cache.put(e.request.url, fetchRes.clone());
                                    // limitCacheSize(DynamicCacheName, 20);
                                    return fetchRes;
                                });

                        }).catch(err => {
                            if (request.mode === 'navigate') {
                                console.log(err);
                                return caches.match('/fallback.html');
                            }

                        })
                );
            })
            .catch(err => {
                if (request.mode === 'navigate') {
                    console.log(err);
                    return caches.match('/fallback.html');
                }
            })
    );
});


self.addEventListener('notificationclick', function (event) {
    var notification = event.notification;
    var action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll()
                .then(function (clis) {
                    var client = clis.find(function (c) {
                        return c.visibilityState === 'visible';
                    });

                    if (client !== undefined) {
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.url);
                    }
                    notification.close();
                })
        );
    }
});

self.addEventListener('notificationclose', function (event) {
    console.log('Notification was closed', event);
});


self.addEventListener('push', function (event) {
    console.log('Push Notification received', event);

    var data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.content,
        icon: '/src/images/icons/app-icon-96x96.png',
        badge: '/src/images/icons/app-icon-96x96.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});


// self.addEventListener('sync', e => {
//     console.log('[Service Worker] Syncing');
//     if (e.tag === 'sync-add-cart') {
//         e.waitUntil(
//             readAllData('sync-cart')
//                 .then(items => {
//                     for (const data of items) {
//                         fetchdata(csrf, `/shop/api/cart/${data.itemId}?cart=${data.cart}`, 'post', JSON.stringify({ attributes: data.attributes, quantity: data.quantity }), true).then(res => {

//                             if (res) {
//                                 cartComponent(res.json.cart.items, csrf)
//                                 grandtotal(res.json.cart)
//                                 setCartId(res.json.cart.sessionId)
//                                 promoBox(res.json.cart)
//                                 deleteItemFromData('sync-cart', data.id)
//                                 localStorage.setItem('c_s', res.json.cart.sessionId)
//                             }
//                         })

//                     }

//                 })
//         )
//     }
// })
