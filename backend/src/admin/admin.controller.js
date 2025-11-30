const Admin = require("./admin.model");
const Teacher = require("../teacher/teacher.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Student = require("../student/student.model")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const postAdmin = async (req, res) => {
  try {
    const { username, password, email, phone, firstName, lastName } = req.body;
    console.log(username,password,email,phone,firstName,lastName)
    const existingUser = await Admin.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    const newUser = new Admin({
      username,
      password: hashedPassword,
      email,
      phone,
      firstName,
      lastName,
    });
    
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user:newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering Admin" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const {username, password} = req.body;
 
    const user = await Admin.findOne({ username });

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


// const mailOptions = {
//   from: `"Lessons App Security" <${process.env.EMAIL_USER}>`,
//   to: user.email,
//   subject: "🔐 [Lessons App] แจ้งเตือนการเข้าสู่ระบบบัญชีของคุณ",
//   html: `
//     <!DOCTYPE html>
//     <html lang="th">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Login Notification</title>
//       <style>
//         @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;700&display=swap');
        
//         /* Reset Styles */
//         body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
//         table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
//         img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
//         /* Main Styles */
//         body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Sarabun', sans-serif; }
//         .btn-hover:hover { opacity: 0.9 !important; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4) !important; transform: translateY(-1px) !important; }
//       </style>
//     </head>
//     <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Sarabun', sans-serif;">

//       <!-- Main Container -->
//       <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; padding: 40px 0;">
//         <tr>
//           <td align="center">
            
//             <!-- Email Card -->
//             <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; max-width: 600px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;">
              
//               <!-- Header: Logo Area (Black/White) -->
//               <tr>
//                 <td align="center" style="padding: 35px 40px 20px 40px; border-bottom: 2px solid #f3f4f6;">
//                   <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
//                     LESSONS<span style="color: #7c3aed;">APP</span>
//                   </h1>
//                   <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280; font-weight: 400;">Modern Learning Platform</p>
//                 </td>
//               </tr>

//               <!-- Body Content -->
//               <tr>
//                 <td align="left" style="padding: 40px 50px;">
                  
//                   <!-- Greeting -->
//                   <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827; font-weight: 600;">
//                     เรียน คุณ ${user.username},
//                   </h2>
                  
//                   <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #374151;">
//                     ระบบได้ตรวจพบการเข้าสู่ระบบบัญชีผู้ใช้งานของคุณ เพื่อความปลอดภัยโปรดตรวจสอบรายละเอียดดังนี้:
//                   </p>

//                   <!-- Info Box (Light Purple Background) -->
//                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; border-left: 4px solid #7c3aed; margin-bottom: 30px;">
//                     <tr>
//                       <td style="padding: 20px;">
//                         <p style="margin: 0; font-size: 14px; color: #5b21b6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">เวลาที่เข้าสู่ระบบ</p>
//                         <p style="margin: 5px 0 0; font-size: 18px; color: #111827; font-weight: 500;">
//                           ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
//                         </p>
//                       </td>
//                     </tr>
//                   </table>

//                   <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
//                     หากนี่คือการดำเนินการของคุณ สามารถกดปุ่มด้านล่างเพื่อเข้าสู่บทเรียนได้ทันที
//                   </p>

//                   <!-- Primary Button (Purple) -->
//                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                     <tr>
//                       <td align="center">
//                         <a href="${process.env.CLIENT_URL}" target="_blank" style="display: inline-block; padding: 14px 40px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #7c3aed; text-decoration: none; border-radius: 50px; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.25);">
//                           เข้าสู่เว็บไซต์
//                         </a>
//                       </td>
//                     </tr>
//                   </table>

//                   <!-- Divider -->
//                   <div style="margin: 40px 0; border-top: 1px solid #e5e7eb;"></div>

//                   <!-- Secondary Section (Security Warning) -->
//                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                     <tr>
//                       <td align="center">
//                          <p style="margin: 0; font-size: 14px; color: #6b7280;">
//                            ⚠️ หากคุณไม่ได้ทำการเข้าสู่ระบบในครั้งนี้
//                          </p>
//                          <p style="margin: 5px 0 0; font-size: 14px;">
//                            <a href="#" style="color: #ef4444; text-decoration: underline; font-weight: 500;">แจ้งปัญหาความปลอดภัย</a> หรือเปลี่ยนรหัสผ่านทันที
//                          </p>
//                       </td>
//                     </tr>
//                   </table>

//                 </td>
//               </tr>

//               <!-- Footer (Black Background) -->
//               <tr>
//                 <td align="center" style="background-color: #111827; padding: 30px 40px;">
//                   <p style="margin: 0 0 10px; font-size: 14px; color: #ffffff; font-weight: 600;">Lessons App</p>
//                   <p style="margin: 0 0 20px; font-size: 12px; color: #9ca3af; line-height: 1.5;">
//                     อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติ<br>
//                     © ${new Date().getFullYear()} Lessons App. All rights reserved.
//                   </p>
                  
//                   <!-- Social / Links -->
//                   <div>
//                     <a href="#" style="color: #7c3aed; text-decoration: none; font-size: 12px; margin: 0 10px;">หน้าหลัก</a>
//                     <span style="color: #4b5563;">|</span>
//                     <a href="#" style="color: #7c3aed; text-decoration: none; font-size: 12px; margin: 0 10px;">ติดต่อเรา</a>
//                     <span style="color: #4b5563;">|</span>
//                     <a href="#" style="color: #7c3aed; text-decoration: none; font-size: 12px; margin: 0 10px;">ความเป็นส่วนตัว</a>
//                   </div>
//                 </td>
//               </tr>

//             </table>
//             <!-- End Email Card -->

//             <!-- Bottom Disclaimer -->
//             <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
//               ไม่ต้องการรับอีเมลแจ้งเตือน? <a href="#" style="color: #6b7280; text-decoration: underline;">ตั้งค่าการแจ้งเตือน</a>
//             </p>

//           </td>
//         </tr>
//       </table>

//     </body>
//     </html>
//   `,
// };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         console.log("Error sending email:", err);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });


    res.status(200).json({ token, user: user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const postTeachers = async (req, res) => {
  try{
    const { username, password, firstName, lastName, phone, email, subjects, classRoom } = req.body;
    const existingUser = await Teacher.findOne({ $or: [ { email }, { username } ] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      email,
      subjects,
      classRoom
    });
    await newTeacher.save();
    res.status(201).json({ message: "Teacher registered successfully", teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: "Error registering Teacher" });
  }
};

const readTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({message : "Fetching success", teachers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
}

const readTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Fetching success", teacher });
  } catch (error) {
    res.status(500).json({ message: "Error fetching teacher" });
  }
}

const readStudents = async (req, res) => {
  try {

    const students = await Student.find();
    res.status(200).json({ message: "Fetching success", students });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students" });
  }
}

const readStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Fetching success", student });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student" });
  }
}


module.exports = { postAdmin,loginAdmin, postTeachers , readTeachers,readTeacherById,readStudents,readStudentById};
