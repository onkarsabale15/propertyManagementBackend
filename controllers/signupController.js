const { checkInputs, createUser, preSignupCheck } = require("../services/signupServices");

const signupController = async (req, res) => {
    const body = req.body;
    const inputCheck = await checkInputs(body);
    if (!inputCheck.success) {
        res.status(400).json({ type: inputCheck.success, message: inputCheck.message })
    }
    else {
        const idExist = await preSignupCheck(body.email, body.phone);
        if (idExist) {
            res.status(409).json({ type: false, message: `${idExist} already Exists` })
        } else {
            const savedUser = await createUser(body);
            res.status(200).json(savedUser);
        }
    }
};

module.exports = signupController;