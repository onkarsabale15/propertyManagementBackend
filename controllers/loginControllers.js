const { preLoginChecks, checkUserAndLogin } = require("../services/loginServices");

const loginController = async (req, res) => {
    const { email, password } = req.body;
    const preLoginCheck = await preLoginChecks(email, password);
    if (!(preLoginCheck.success)) {
        res.status(400).json({ type: false, message: preLoginCheck.message })
    } else {
        const isLoggedin = await checkUserAndLogin(email, password);
        res.status(isLoggedin.status).json(isLoggedin)
    }
};

module.exports = loginController;