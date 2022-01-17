const passport = require("passport");
const { catchAsync, ExpressError } = require("../helpers/errors");
const { sendEmailLink } = require("../helpers/email");

const User = require("../models/User");
const Link = require("../models/Link");


// --- REGISTER ----
module.exports.registerForm = (req, res) => {
	res.render("auth/register");
};


module.exports.registerUser = catchAsync(async (req, res, next) => {
	const { email, displayName, password } = req.body.newUser;
	const newUser = new User({displayName, email: {address: email}});
	const user = await User.register(newUser, password);
	req.login(user, async (err) => {
		if (err) return next(err);
		const redirect = req.session.redirectedFrom || `/users/${user.id}`;
		delete req.session.redirectedFrom;
		req.flash(
			"success",
			"Welcome! Please check your inbox and verify your email address."
		);
		return res.redirect(redirect);
	});
});


// --- LOGIN LOCAL ---
module.exports.loginForm = (req, res) => {
	res.render("auth/login");
};


module.exports.loginLocal = (req, res) => {
	const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
	delete req.session.redirectedFrom;
	req.flash("success", "Welcome back!");
	res.redirect(redirection);
};


// --- LOGIN GOOGLE ---
module.exports.loginGoogle = (req, res) => {
	const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
	delete req.session.redirectedFrom;
	if (req.user.email && !req.user.verified) {
		req.flash(
			"success",
			"Welcome! Please check your inbox and verify your email address."
		);
	} else {
		req.flash("success", "Welcome back!");
	}
	res.redirect(redirection);
};


// --- LOGOUT ALL ---
module.exports.logout = (req, res) => {
	req.logout();
	req.flash("success", "Successfully logged out!");
	res.redirect("login");
};


// --- EMAIL VERIFICATION ----
module.exports.verifyEmailVerification = catchAsync(async (req, res, next) => {
	const code = req.query.ulc;
	const link = await Link.findOneAndUpdate(
		{ code },
		{ valid: false, expireAt: Date.now() }
	);
	if (!link || link.referenceID !== req.user.id) {
		const msg =
			"Unable to verify email. Please try again or request a new link.";
		throw new ExpressError(msg, 400, `/users/${req.user.id}`);
	}
	await User.updateOne(
    {_id: req.user.id},
    {verified: true, 'email.verified': true}
  );
	req.flash("success", "Thank you! Email has been verified.");
	res.redirect(`/users/${req.user.id}`);
});


module.exports.verifyEmailSend = catchAsync(async (req, res, next) => {
	const { id } = req.body;
	const user = await User.findById(id);
	if (!user || user.verified) {
		throw new ExpressError(
			"Email is either not registered or already verified.",
			400
		);
  }
	sendEmailLink(user, "emailVerify");
	req.flash(
		"success",
		"A verification email has been sent.  Please check your spam folder if you do not see it in your inbox."
	);
	res.redirect(`/users/${id}`);
});


module.exports.updatePassForm = (req, res) => {
	res.render("auth/update");
};


module.exports.updatePassResult = catchAsync(async (req, res, next) => {
  const { currentPass, password } = req.body;
  const user = await User.findById(req.user.id);
  await user.changePassword(currentPass, password);
  await user.save();
  req.flash("success", "Successfully updated password");
  res.redirect(`/auth/${user.id}`);
});


module.exports.resetPassRequestForm = (req, res) => {
	res.render("auth/reset");
};


module.exports.resetPassUpdateForm = (req, res) => {
	const { ulc } = req.query;
	res.render("auth/update", { ulc });
};


module.exports.resetPassRequestResult = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ 'email.address': req.body.email });
  if (!user || !user.verified || user.googleID) {
    const msg =
      "Email is either not regitered, verified, or is associated with an alternative login method.";
    throw new ExpressError(msg, 400, "/auth/login");
  }
  req.flash(
    "success",
    "A message has been sent to the email address.  Please check your spam folder if you do not see it in your inbox."
  );
  await sendEmailLink(user, "resetRequest");

  res.redirect("/auth/login");
});


module.exports.resetPassUpdateResult = catchAsync(async (req, res, next) => {
  const code = req.body.ulc;
  const link = await Link.findOneAndUpdate(
    { code },
    { valid: false, expireAt: Date.now() }
  );
  const user = await User.findById(link.referenceID);
  if (!user) {
    const msg = "Unable to update password.";
    throw new ExpressError(msg, 400, "/auth/login");
  }
  await user.setPassword(req.body.password);
  await user.save();
  await sendEmailLink(user, 'resetUpdated');
  req.flash("success", "Successfully updated password");
  res.redirect("/auth/login");
});
