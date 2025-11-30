const Auth = require("./auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // --- 1. เพิ่มบรรทัดนี้ ---

// --- 2. ตั้งค่า Config สำหรับส่งอีเมล (วางไว้นอก Function) ---
const transporter = nodemailer.createTransport({
  service: "gmail", // ใช้ Gmail (หรือ SMTP อื่นๆ)
  auth: {
    user: process.env.EMAIL_USER, // อีเมลคนส่ง (ต้องไปตั้งใน .env)
    pass: process.env.EMAIL_PASS, // รหัสผ่าน App Password (ต้องไปตั้งใน .env)
  },
});

// Register Controller (เหมือนเดิม ไม่ต้องแก้)
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
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login Controller (แก้ไขตรงนี้)
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ค้นหา User
    const user = await Auth.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // สร้าง Token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // --- 3. เพิ่ม Logic การส่งอีเมลตรงนี้ ---
    // ส่งหา user.email ที่เราดึงมาจาก Database ข้างบน
    const mailOptions = {
      from: process.env.EMAIL_USER, // ส่งจากใคร
      to: user.email,               // *** ส่งหาอีเมลของ User ที่ Login เข้ามา ***
      subject: "Lessons App - แจ้งเตือนการเข้าสู่ระบบ", // หัวข้อเมล
      html: `
        <h3>สวัสดีคุณ ${user.username}</h3>
        <p>มีการเข้าสู่ระบบบัญชีของคุณเมื่อ ${new Date().toLocaleString('th-TH')}</p>
        <p>หากไม่ใช่คุณ โปรดติดต่อผู้ดูแลระบบทันที</p>
      `,
    };

    // สั่งส่งเมล (ไม่ต้อง await ก็ได้เพื่อให้ response ไวขึ้น แต่ถ้าอยากชัวร์ว่าส่งผ่านค่อยใส่ await)
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending email:", err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    // -------------------------------------

    res.status(200).json({ token, user: user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { postUser, loginUser };