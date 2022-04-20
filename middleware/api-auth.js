module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) return res.status(401).json({ message: "Please login to continue", messageType: 'info' })
    next();
}