const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Subscription = mongoose.model('subscribers');
const q = require('q');
const webPush = require('web-push');
// const keys = require('./../config/keys');
router.post('/', async (req, res) => {

    const payload = {
        title: req.body.title,
        message: req.body.message,
        url: req.body.url,
        ttl: req.body.ttl,
        icon: req.body.icon,
        image: req.body.image,
        badge: req.body.badge,
        tag: req.body.tag
    };
    try {
        // await Subscription.deleteMany({})

        const subscriptions = await Subscription.find({})

        webPush.setVapidDetails('mailto:amsstudio.e@gmail.com', "BIJupMjgcWmTy5hNscIxPW5o5oqJtl1vTTn8dyFato9J7gP-r0vnuYlsJzIuCMz2lPOa7_7Eed4Gof_onMZwqT4", "JL32c2yGKNo6Utz7jlu20ss2P3YIp57VX3dlNQb1-6U")

        subscriptions.forEach(sub => {
            let pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.keys.auth,
                    p256dh: sub.keys.p256dh
                }
            }
            // console.log(sub);
            webPush.sendNotification(sub, JSON.stringify(payload)).catch(function (err) {
                console.log(err)
            })
        })
        // let parallelSubscriptionCalls = subscriptions.map((subscription) => {
        //     return new Promise((resolve, reject) => {
        //         const pushSubscription = {
        //             endpoint: subscription.endpoint,
        //             keys: {
        //                 p256dh: subscription.keys.p256dh,
        //                 auth: subscription.keys.auth
        //             }
        //         };

        //         const pushPayload = JSON.stringify(payload);
        //         const pushOptions = {
        //             vapidDetails: {
        //                 subject: 'http://localhost:3000',
        //                 privateKey: keys.privateKey,
        //                 publicKey: keys.publicKey
        //             },
        //             TTL: payload.ttl,
        //             headers: {}
        //         };
        //         webPush.sendNotification(
        //             pushSubscription,
        //             pushPayload,
        //             pushOptions
        //         ).then((value) => {
        //             resolve({
        //                 status: true,
        //                 endpoint: subscription.endpoint,
        //                 data: value
        //             });
        //         }).catch((err) => {
        //             console.log(err);
        //             reject({
        //                 status: false,
        //                 endpoint: subscription.endpoint,
        //                 data: err
        //             });
        //         });
        //     });
        // });
        // q.allSettled(parallelSubscriptionCalls).then((pushResults) => {
        //     // console.info(pushResults[0]);

        // });
        return res.json({ data: 'Push triggered' });

    } catch (error) {
        console.log(error);
        console.error(`Error occurred while getting subscriptions`);
        return res.status(500).json({ error: 'Technical error occurred' });
    }

});

router.get('/', (req, res) => {
    res.json({
        data: 'Invalid Request Bad'
    });
});
module.exports = router;