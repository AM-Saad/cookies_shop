// /*jslint browser: true*/

// /*global console, alert, $, jQuery*/



let deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');


if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("../../sw.js")
        .then(reg => {
            console.log('service worker registered');

        })
        .catch(err => {
            console.log("Server Worker Not registered", err);
        });

    // Add Home Screen Button
    let btn = $('.install-btn');
    window.addEventListener('beforeinstallprompt', e => {
        console.log('ready to install..');
        e.preventDefault();
        deferredPrompt = e;
        $('.install-btn').removeClass('none');
    })

    btn.on('click', e => {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then(choiceResult => {
            $('.install-btn').addClass('none');

            if (choiceResult === 'accepted') {

            }
        })
    })

    if (window.matchMedia('(display-mode: standalone)').matches) {
        // do things here  
        // set a variable to be used when calling something  
        // e.g. call Google Analytics to track standalone use
        $('.install-btn').addClass('none');

    }

}


// function urlBase64ToUint8Array(base64String) {
//   var padding = '='.repeat((4 - base64String.length % 4) % 4);
//   var base64 = (base64String + padding)
//     .replace(/\-/g, '+')
//     .replace(/_/g, '/');

//   var rawData = window.atob(base64);
//   var outputArray = new Uint8Array(rawData.length);

//   for (var i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }


// function displayConfirmNotification() {
//   if ('serviceWorker' in navigator) {
//     var options = {
//       body: 'You successfully subscribed to our Notification service!',
//       icon: '/shop/images/icons/maskable_icon_x96.png',
//       image: '/shop/images/icons/maskable_icon_x96.png',
//       dir: 'ltr',
//       lang: 'en-US', // BCP 47,
//       vibrate: [100, 50, 200],
//       badge: '/shop/images/icons/maskable_icon_x96.png',
//       tag: 'confirm-notification',
//       renotify: true,
//       actions: [
//         { action: 'confirm', title: 'Okay', icon: '/shop/images/icons/maskable_icon_x96.png' },
//         { action: 'cancel', title: 'Cancel', icon: '/shop/images/icons/maskable_icon_x96.png' }
//       ]
//     };

//     navigator.serviceWorker.ready
//       .then(function (swreg) {
//         swreg.showNotification('Successfully subscribed!', options);
//       });
//   }
// }


// function configurePushSub() {
//   if (!('serviceWorker' in navigator)) {
//     return;
//   }

//   var reg;
//   navigator.serviceWorker.ready
//     .then(function (swreg) {
//       reg = swreg;
//       return swreg.pushManager.getSubscription();
//     })
//     .then(function (sub) {
//       if (sub === null) {
//         // Create a new subscription
//         var vapidPublicKey = 'BKjDvGGs2RuwdLMzGVYYXVSb2ytxu3t6r_LJ1Xeb4X-ROtx5b6UJxxkk0ELo9JQuB3qxKJP_qZ_raxf4DR_Bz3E';
//         var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
//         return reg.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: convertedVapidPublicKey
//         });
//       } else {
//         return;
//       }
//     })
//     .then(function (newSub) {
//       console.log(newSub);
//       return fetch('http://localhost:3500/subscribe', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify(newSub)
//       })
//     })
//     .then(function (res) {
//       console.log(res);
//       if (res.status === 200 || res.status == 201) {
//         displayConfirmNotification();
//       }
//     })
//     .catch(function (err) {
//       console.log(err);
//     });
// }

// function askForNotificationPermission() {
//   Notification.requestPermission(function (result) {
//     console.log('User Choice', result);
//     if (result !== 'granted') {
//       console.log('No notification permission granted!');
//     } else {
//       configurePushSub();
//       // displayConfirmNotification();
//     }
//   });
// }

// if ('Notification' in window && 'serviceWorker' in navigator) {
//   for (var i = 0; i < enableNotificationsButtons.length; i++) {
//     enableNotificationsButtons[i].style.display = 'inline-block';
//     enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
//   }
// }



