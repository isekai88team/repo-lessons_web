const Auth = require("./auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Controller
const postUser = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    const existingUser = await Auth.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Auth({
      username,
      password: hashedPassword,
      email,
      phone,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {}
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Auth.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
       

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.status(200).json({ token , user: user });


    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}



module.exports = { postUser ,loginUser };
