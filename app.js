const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const uuidv4 = require('uuid/v4')//for Multer
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const errorController = require("./controllers/error");
const flash = require('connect-flash');
var cors = require('cors');

const webPush = require('web-push');


let app = express();

const MONGODBURI = `mongodb+srv://amsdb:bodakaka@edu-apps.3vj9u.mongodb.net/cookies?retryWrites=true&w=majority`;

const store = new MongoDBStore({
    uri: MONGODBURI,
    collection: "sessions"
});


// const csrfProtection = csrf();





require('./models/subscribers_model');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
            return cb(message, null);
        }

        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
};



app.set('trust proxy', true);
app.use(cors()) // Use this after the variable declaration

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).array("image", 10));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());



app.set('view engine', 'ejs');
app.set('views', 'views');




app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);




const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const publicRoutes = require("./routes/public");
const shopApiRoutes = require('./routes/shop-api');
const shopRoutes = require('./routes/shop');

const push = require('./routes/push');
const subscribe = require('./routes/subscribe');



// app.use(csrfProtection);


app.use((req, res, next) => {
    if (!req.session) return next();
    // let token = req.csrfToken();
    const user = req.session.user
    req.isLoggedIn = req.session.isLoggedIn
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.isAdmin = req.session.isAdmin;
    res.locals.lang = req.query.lang ? req.query.lang : 'en'
    req.user = user;
    res.locals.csrfToken = 'token';

    next();

});


app.use('/admin', adminRoutes);
app.use(publicRoutes);
app.use(authRoutes);

app.use('/subscribe', subscribe);
app.use('/push', push);

app.use('/shop/api', shopApiRoutes);
app.use(shopRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error)  
    return res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
        error:error
    });
});


mongoose
    .connect(MONGODBURI)
    .then(result => {
        console.log('connected');

        return app.listen(process.env.PORT || 4500);
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    });
