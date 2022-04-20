module.exports.authenticate = async (req, user, isAdmin, jwt) => {
    try {
        let token = jwt.sign(
            {
                isLoggedIn: true,
                isAdmin: isAdmin,
                user: user
            },
            "SomeSuperAsecretBymy",
        );
        req.session.isLoggedIn = true;
        req.session.user = user
        req.session.isAdmin = isAdmin

        return { status: true, token: token, session: req.session }

    } catch (error) {
        console.log(error)
    }


}