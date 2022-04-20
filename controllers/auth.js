var mongoose = require("mongoose");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Category = require("../models/Category");
const { google } = require("googleapis");
const bcrypt = require("bcryptjs");
const { createcart } = require("../models/helpers/cart.js");

const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const msg = require("../util/message");

exports.getLogin = async (req, res, next) => {
  const msgs = msg(req, res)

  const categories = await Category.find()
  const all = await Cart.find()
  console.log(all);

  return res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errmsg: msgs.err,
    succmsg: msgs.success,
    categories: categories,
    isAdmin: req.session.isAdmin,
    isAuthenticated: req.session.isLoggedIn,

  });
};

exports.postLogin = async (req, res, next) => {
  const mobile = req.body.mobile;
  const password = req.body.password;

  const user = await User.findOne({ mobile: mobile })
  if (!user) {
    req.flash("alert", "Make sure you entered a valid mobile and password!!");
    return res.redirect("/login");
  }
  if (user.signUpToken) {
    req.flash("alert", "Please Verfiy Your Account First");
    return res.redirect("/login");
  }

  const doMatch = await bcrypt.compare(password, user.password)
  if (!doMatch) {
    req.flash("alert", "Make sure you entered a valid mobile and password!!");
    return res.redirect("/login");
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  return req.session.save(err => {
    req.flashx
    return res.redirect("/");
  });


};
exports.getSignUp = async (req, res, next) => {
  const msgs = msg(req, res)

  const categories = await Category.find()

  // await User.deleteMany({})
  // await Order.deleteMany({})
  // await Cart.deleteMany({})
  return res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    isAuthenticated: false,
    errmsg: msgs.err,
    succmsg: msgs.success,
    hasError: false,
    categories: categories,
    isAdmin: req.session.isAdmin,
    isAuthenticated: req.session.isLoggedIn,

    oldInputs: {
      name: "",
      password: "",
      confirmPassword: "req.body.confirmPassword"
    }
  });
};

exports.postSignup = async (req, res, next) => {
  const { name, password, mobile, cart } = req.body

  const errors = validationResult(req);

  const categories = await Category.find()
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/signup",
      pageTitle: "Sign Up",
      isAuthenticated: false,
      errmsg: errors.array()[0].msg,
      hasError: true,
      succmsg: null,
      isAdmin: req.session.isAdmin,
      isAuthenticated: req.session.isLoggedIn,

      categories: categories,
      oldInputs: {
        name: name,
        password: '',
        confirmPassword: '',
        mobile: req.body.mobile,
      }
    });
  }
  try {
    const userDoc = await User.findOne({ mobile: mobile })

    if (userDoc) {
      return res.status(422).render("auth/login", {
        path: "/signup",
        pageTitle: "Sign Up",
        isAuthenticated: false,
        errmsg: "Mobile is Already Exist, if its you click link below to reset password",
        hasError: true,
        succmsg: null,
        categories: categories,
        isAdmin: req.session.isAdmin,
        isAuthenticated: req.session.isLoggedIn,

        oldInputs: {
          name: name,
          password: '',
          confirmPassword: '',
          mobile: req.body.mobile,
        }
      });
    }


    const hashedPassword = await bcrypt.hash(password, 12)

    let sessionId

    if (!cart) {
      const newcart = createcart(Cart)
      await newcart.save()
      sessionId = newcart.sessionId
    } else {
      const forUser = await User.findOne({ cart: cart })
      if (forUser) {
        const newcart = createcart(Cart)
        await newcart.save()
        sessionId = newcart.sessionId
      } else {
        sessionId = cart
      }
    }
    console.log(sessionId);


    const user = new User({
      name: name,
      password: hashedPassword,
      mobile: mobile,
      // address: address,
      cart: sessionId,
      signUpToken: '',
      orders: []
    });
    await user.save();

    //  const sendmail = await transporter.sendMail({
    //     to: email,
    //     from: "OnlineShop@mail.com",
    //     subject: "You Successfully Signed up",
    //     html: `<p> We're glad to be one of our commuinty one last step just click the link below to verify your account now </p>
    //            <p> Click <a href="https://online-shop20.herokuapp.com/verfiy/${token}"> HERE </a> </p> })`


    req.flash('success', 'Glad to join our commuinty, one last step please login ')
    return res.redirect("/login");

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }




};

exports.getSignWithGoogle = (req, res, next) => {
  const oauth2Client = new google.auth.OAuth2(
    "332841012683-h94tab8psir5ed08p2f5htb63libsego.apps.googleusercontent.com",
    "kckeqDdMu-J4WuKI9wx8dSu0",
    "http://localhost:3000/auth/google/callback"
  );

  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = ["https://www.googleapis.com/auth/userinfo.email"];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",

    // If you only need one scope you can pass it as a string
    scope: scopes
  });
  res.redirect(url);
};

exports.getVerify = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ signUpToken: token })
    .then(user => {
      if (!user) {
        return res.redirect("/");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      return res.render("auth/verfiy", {
        path: "/Vefiy",
        pageTitle: "Verify Your Account",
        isAuthenticated: false,
        errmsg: message,
        signUpToken: token
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/");
    });
};


exports.postVerify = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then(user => {
      user.signUpToken = undefined;
      return user.save();
    })
    .then(result => {
      return res.redirect("/");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    return res.redirect("/");
  });
};

exports.getResetPass = (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset your password",
    isAuthenticated: false,
    errmsg: message,
    isAdmin: req.session.isAdmin,
    isAuthenticated: req.session.isLoggedIn,

  });
};

exports.postResetPass = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash("error", "This Email Dosent Found!!!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpr = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        transporter.sendMail({
          to: req.body.email,
          from: "onlineShop@mail.com",
          subject: "Password Reset...",
          html: `<p>You Requsetd a password reset</p>
                <p>Click <a href="https://online-shop20.herokuapp.com/reset/${token}">HERE</a> To Change It</p> `
        });
        return res.render("thanks", {
          path: "/Reset-Request",
          pageTitle: "Request Submitted",
          isAuthenticated: false,
          isAdmin: req.session.isAdmin,
          isAuthenticated: req.session.isLoggedIn,
  
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpr: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      return res.render("auth/new-password", {
        path: "/NewPassword",
        pageTitle: "Reset your password",
        isAuthenticated: false,
        errmsg: message,
        userId: user._id.toString(),
        passwordToken: token,
        isAdmin: req.session.isAdmin,
        isAuthenticated: req.session.isLoggedIn,

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpr: { $gt: Date.now() }
  }).then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetToken = undefined;
      return resetUser.save();
    })
    .then(result => {
      return res.render("auth/login", {
        succmsg:
          "You Have Succssfuly Reseted Your Password, Login In Again.",
        path: "/Password Reseted",
        pageTitle: "Login",
        errmsg: null
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getThanks = (req, res, next) => {
  return res.render("thanks", {
    path: "/thanks",
    pageTitle: "Thank Your For Sign up",
    isAuthenticated: false,
    isAdmin: req.session.isAdmin,
    isAuthenticated: req.session.isLoggedIn,

  });
};
