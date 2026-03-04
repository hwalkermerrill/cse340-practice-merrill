const requireLogin = (req, res, next) => {
	// Check if user is logged in via session, if not, redirect to login
	// TODO: Beef up with roles and permissions once established
	if (req.session && req.session.user) {
		res.locals.isLoggedIn = true;
		next();
	} else {
		res.redirect("/login");
	}
};

export { requireLogin };