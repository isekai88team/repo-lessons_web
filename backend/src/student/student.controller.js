const Student = require("./student.model");
const bcrypt = require("bcryptjs");
const Subjects = require("../subject/subject.model");
const Chapter = require("../chapter/chapter.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const geoip = require("geoip-lite");

// Additional imports for quiz and progress functionality
const PretestSheet = require("../pretestsheet/pretestsheet.model");
const PosttestSheet = require("../posttestsheet/posttestsheet.model");
const TestResult = require("../progress/testResult.model");
const StudentProgress = require("../progress/studentProgress.model");

const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- Check user exists ---
    const user = await Student.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // --- Validate password ---
    // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
    const isHashed =
      user.password.startsWith("$2a$") || user.password.startsWith("$2b$");

    let isPasswordValid = false;

    if (isHashed) {
      // Password is hashed - use bcrypt.compare
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (legacy) - compare directly
      isPasswordValid = password === user.password;

      // If valid, migrate to hashed password
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Student.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log(`Migrated password for student: ${username}`);
      }
    }

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // --- Generate JWT Token ---
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ========== Detect IP & Location ==========
    let loginIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // clean IPv6 localhost
    if (loginIP === "::1") loginIP = "127.0.0.1";

    // some proxies send "IP, anotherIP"
    if (loginIP.includes(",")) {
      loginIP = loginIP.split(",")[0].trim();
    }

    const geo = geoip.lookup(loginIP);
    const loginLocation = {
      city: geo?.city || "Unknown",
      country: geo?.country || "Unknown",
    };

    // ========== Email HTML ==========
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

    // ========== Send Email ==========
    // transporter.sendMail(mailOptions, (err, info) => {
    //   if (err) console.log("Error sending email:", err);
    //   else console.log("Email sent:", info.response);
    // });

    // ========== Return Response ==========
    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get full video URL for authenticated students
const getChapterFullVideo = async (req, res) => {
  try {
    const { chapterId } = req.params;
    console.log("📹 Fetching video for chapterId:", chapterId);

    const chapter = await Chapter.findById(chapterId)
      .populate({
        path: "subject",
        populate: { path: "teacher", select: "firstName lastName" },
      })
      .lean();

    console.log("📹 Chapter found:", chapter ? "Yes" : "No");
    console.log("📹 video_url:", chapter?.video_url);
    console.log("📹 document_url:", chapter?.document_url);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Authenticated users get full video URL
    res.status(200).json({
      chapter: {
        _id: chapter._id,
        chapter_name: chapter.chapter_name,
        description: chapter.description,
        video_url: chapter.video_url, // Full video for authenticated users
        preview_video_url: chapter.preview_video_url,
        document_url: chapter.document_url,
      },
      subject: chapter.subject
        ? {
            _id: chapter.subject._id,
            subject_name: chapter.subject.subject_name,
            code: chapter.subject.code,
            teacher: chapter.subject.teacher,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching full video:", error);
    res
      .status(500)
      .json({ message: "Error fetching chapter", error: error.message });
  }
};

// Get student profile (for logged in student)
const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ student });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Update student profile (for logged in student)
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      bio,
      dateOfBirth,
      profileImage,
    } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const student = await Student.findByIdAndUpdate(
      req.user.userId,
      updateData,
      {
        new: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Change password (for logged in student)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.user.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check current password
    const isHashed =
      student.password.startsWith("$2a$") ||
      student.password.startsWith("$2b$");
    let isPasswordValid = false;

    if (isHashed) {
      isPasswordValid = await bcrypt.compare(currentPassword, student.password);
    } else {
      isPasswordValid = currentPassword === student.password;
    }

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Student.findByIdAndUpdate(req.user.userId, {
      password: hashedPassword,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};

// Get chapter progress for logged in student
const getChapterProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const StudentProgress = require("../progress/studentProgress.model");

    let progress = await StudentProgress.findOne({
      student: req.user.userId,
      chapter: chapterId,
    });

    if (!progress) {
      // Get chapter to find subject
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      // Create initial progress
      progress = await StudentProgress.create({
        student: req.user.userId,
        subject: chapter.subject,
        chapter: chapterId,
      });
    }

    res.status(200).json({ progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress" });
  }
};

// Update video progress (current watch time percentage)
const updateVideoProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { progress } = req.body; // 0-100 percentage
    const StudentProgress = require("../progress/studentProgress.model");

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const updatedProgress = await StudentProgress.findOneAndUpdate(
      { student: req.user.userId, chapter: chapterId },
      {
        $set: { videoProgress: progress },
        $setOnInsert: { subject: chapter.subject },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ progress: updatedProgress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Error updating progress" });
  }
};

// Mark video as completed
const markVideoComplete = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const studentId = req.userId; // Use req.userId for consistency
    const StudentProgress = require("../progress/studentProgress.model");

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const progress = await StudentProgress.findOneAndUpdate(
      { student: studentId, chapter: chapterId },
      {
        $set: {
          videoWatched: true,
          videoProgress: 100,
        },
        $setOnInsert: { subject: chapter.subject },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Video marked as complete",
      progress,
    });
  } catch (error) {
    console.error("Error marking video complete:", error);
    res.status(500).json({ message: "Error marking video complete" });
  }
};

// Get my progress (for logged in student)
const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const StudentProgress = require("../progress/studentProgress.model");
    const TestResult = require("../progress/testResult.model");
    const FinalExam = require("../progress/finalExam.model");
    const Enrollment = require("../progress/enrollment.model");
    const Subject = require("../subject/subject.model");

    const student = await Student.findById(studentId)
      .select("-password")
      .lean();
    if (!student) {
      return res.status(404).json({ message: "ไม่พบข้อมูลนักเรียน" });
    }

    // Get all progress records for this student
    const allProgressRecords = await StudentProgress.find({
      student: studentId,
    })
      .populate("subject")
      .lean();

    // Get unique subject IDs from progress records
    const progressSubjectIds = [
      ...new Set(
        allProgressRecords
          .map((p) => p.subject?._id?.toString())
          .filter(Boolean)
      ),
    ];

    // Also check enrollments
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "subject",
        populate: { path: "teacher", select: "firstName lastName" },
      })
      .lean();

    const enrolledSubjectIds = enrollments.map((e) => e.subject._id.toString());

    // Combine all subject IDs
    const allSubjectIds = [
      ...new Set([...progressSubjectIds, ...enrolledSubjectIds]),
    ];

    // Fetch all relevant subjects
    const allSubjects = await Subject.find({ _id: { $in: allSubjectIds } })
      .populate("teacher", "firstName lastName")
      .lean();

    // Process each subject
    const subjectsProgress = await Promise.all(
      allSubjects.map(async (subject) => {
        // Find enrollment for this subject
        const enrollment = enrollments.find(
          (e) => e.subject._id.toString() === subject._id.toString()
        );

        // Get all chapters for this subject
        const chapters = await Chapter.find({ subject: subject._id })
          .sort({ createdAt: 1 })
          .lean();

        // Get progress for each chapter
        const chaptersProgress = await Promise.all(
          chapters.map(async (chapter) => {
            const progress = await StudentProgress.findOne({
              student: studentId,
              chapter: chapter._id,
            }).lean();

            // Get test results
            const pretestResults = await TestResult.find({
              student: studentId,
              chapter: chapter._id,
              testType: "pretest",
            })
              .sort({ submittedAt: -1 })
              .limit(1)
              .lean();

            const posttestResults = await TestResult.find({
              student: studentId,
              chapter: chapter._id,
              testType: "posttest",
            })
              .sort({ submittedAt: -1 })
              .limit(1)
              .lean();

            return {
              _id: chapter._id,
              chapter_name: chapter.chapter_name,
              hasVideo: !!chapter.video_url,
              hasDocument: !!chapter.document_url,
              progress: progress || {
                videoWatched: false,
                videoProgress: 0,
                documentViewed: false,
                pretestCompleted: false,
                posttestCompleted: false,
                isCompleted: false,
              },
              lastPretestResult: pretestResults[0] || null,
              lastPosttestResult: posttestResults[0] || null,
            };
          })
        );

        // Calculate subject progress
        const completedChapters = chaptersProgress.filter(
          (c) => c.progress.isCompleted
        ).length;

        const videoWatchedChapters = chaptersProgress.filter(
          (c) => c.progress.videoWatched || c.progress.videoProgress >= 90
        ).length;

        const averageVideoProgress =
          chaptersProgress.length > 0
            ? Math.round(
                chaptersProgress.reduce(
                  (sum, c) => sum + (c.progress.videoProgress || 0),
                  0
                ) / chaptersProgress.length
              )
            : 0;

        const subjectProgress = chapters.length > 0 ? averageVideoProgress : 0;

        // Check final exam
        const finalExam = await FinalExam.findOne({
          subject: subject._id,
        }).lean();
        const canTakeFinalExam =
          completedChapters === chapters.length && chapters.length > 0;

        const finalExamResult = await TestResult.findOne({
          student: studentId,
          subject: subject._id,
          testType: "final",
        })
          .sort({ submittedAt: -1 })
          .lean();

        return {
          isEnrolled: !!enrollment,
          enrollment: enrollment
            ? {
                _id: enrollment._id,
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
              }
            : null,
          subject: {
            _id: subject._id,
            subject_name: subject.subject_name,
            code: subject.code,
            teacher: subject.teacher,
          },
          progress: subjectProgress,
          completedChapters,
          videoWatchedChapters,
          totalChapters: chapters.length,
          chapters: chaptersProgress,
          finalExam: finalExam
            ? {
                _id: finalExam._id,
                title: finalExam.title,
                isActive: finalExam.isActive,
                canTake: canTakeFinalExam,
                result: finalExamResult,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      student,
      subjects: subjectsProgress,
    });
  } catch (error) {
    console.error("Error fetching my progress:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// ============ LEARNING FLOW APIs ============

// Get Chapter Tests (Pretest & Posttest) for learning flow
const getChapterTests = async (req, res) => {
  try {
    const studentId = req.userId;
    const { id: chapterId } = req.params;

    console.log("=== getChapterTests Debug ===");
    console.log("Chapter ID:", chapterId);

    // Fetch pretest and posttest for this chapter
    const pretest = await PretestSheet.findOne({
      chapter: chapterId,
      isActive: true,
    });

    console.log("Pretest found:", pretest ? pretest._id : "null");
    console.log("Pretest questions count:", pretest?.questions?.length || 0);

    let posttest = await PosttestSheet.findOne({
      chapter: chapterId,
      isActive: true,
    }).populate("sourcePretest");

    console.log("Posttest found:", posttest ? posttest._id : "null");
    console.log("Posttest title:", posttest?.title || "null");
    console.log("Posttest chapter:", posttest?.chapter || "null");
    console.log("Expected chapter:", chapterId);
    console.log(
      "Posttest sourcePretest ID:",
      posttest?.sourcePretest?._id || "null"
    );
    console.log(
      "Posttest sourcePretest questions count:",
      posttest?.sourcePretest?.questions?.length || 0
    );
    // Log question types for debugging
    if (posttest?.sourcePretest?.questions) {
      const questionsByType = {};
      posttest.sourcePretest.questions.forEach((q) => {
        questionsByType[q.questionType] =
          (questionsByType[q.questionType] || 0) + 1;
      });
      console.log("Question types in sourcePretest:", questionsByType);
    }

    // Auto-link: If posttest exists but has no sourcePretest, use pretest from same chapter
    if (posttest && !posttest.sourcePretest && pretest) {
      console.log("Auto-linking posttest to pretest:", pretest._id);
      posttest.sourcePretest = pretest;
    }

    if (!posttest) {
      // Check without isActive filter
      const anyPosttest = await PosttestSheet.findOne({ chapter: chapterId });
      console.log(
        "Any Posttest (without isActive):",
        anyPosttest
          ? `${anyPosttest._id} (isActive: ${anyPosttest.isActive})`
          : "null"
      );
    }

    // Fetch student's progress
    const progress = await StudentProgress.findOne({
      student: studentId,
      chapter: chapterId,
    });

    // Fetch test results
    const pretestResult = await TestResult.findOne({
      student: studentId,
      chapter: chapterId,
      testType: "pretest",
    }).sort({ createdAt: -1 });

    const posttestResult = await TestResult.findOne({
      student: studentId,
      chapter: chapterId,
      testType: "posttest",
    }).sort({ createdAt: -1 });

    // Prepare posttest with randomized questions (without answers)
    let posttestWithQuestions = null;
    if (posttest) {
      console.log(
        "Posttest sourcePretest:",
        posttest.sourcePretest ? posttest.sourcePretest._id : "null"
      );
      console.log(
        "Posttest sourcePretest questions:",
        posttest.sourcePretest?.questions?.length || 0
      );

      if (posttest.sourcePretest && posttest.sourcePretest.questions) {
        // Use fresh pretest data if sourcePretest matches the chapter's pretest
        // This ensures we always get the latest questions even after admin edits
        let sourceQuestions;
        if (
          pretest &&
          posttest.sourcePretest._id.toString() === pretest._id.toString()
        ) {
          // Use fresh pretest questions from chapter (latest data)
          sourceQuestions = pretest.questions || [];
          console.log("Using fresh pretest questions from chapter");
        } else {
          // Use populated sourcePretest questions
          sourceQuestions = posttest.sourcePretest.questions || [];
          console.log("Using sourcePretest questions from populate");
        }
        let shuffled = [...sourceQuestions];
        if (posttest.shuffleQuestions) {
          shuffled = shuffled.sort(() => Math.random() - 0.5);
        }
        // Use questionCount from posttest settings
        console.log("=== Posttest Debug ===");
        console.log("Posttest ID:", posttest._id);
        console.log("posttest.questionCount from DB:", posttest.questionCount);
        console.log("Source questions (all types):", sourceQuestions.length);

        const questionCount = posttest.questionCount || sourceQuestions.length;
        console.log("Final questionCount used:", questionCount);

        const selected = shuffled.slice(
          0,
          Math.min(questionCount, shuffled.length)
        );
        console.log("Selected questions count:", selected.length);

        // Remove correct answers from questions sent to client
        const questionsWithoutAnswers = selected.map((q) => {
          // For matching questions, send shuffled answer options
          let answerOptions = null;
          if (q.questionType === "matching" && q.matchingPairs) {
            answerOptions = q.matchingPairs
              .map((p) => p.right)
              .sort(() => Math.random() - 0.5);
          }
          return {
            _id: q._id,
            questionText: q.questionText,
            questionImage: q.questionImage, // Include question image
            questionType: q.questionType,
            options: q.options,
            points: q.points,
            matchingPairs: q.matchingPairs?.map((p) => ({
              left: p.left,
              leftImage: p.leftImage,
            })),
            answerOptions, // shuffled right answers for matching
          };
        });

        posttestWithQuestions = {
          _id: posttest._id,
          title: posttest.title,
          description: posttest.description,
          duration: posttest.duration,
          passingScore: posttest.passingScore,
          questions: questionsWithoutAnswers,
          totalPoints: selected.reduce((sum, q) => sum + (q.points || 1), 0),
        };
      } else {
        // Posttest exists but no sourcePretest questions - still return basic info
        console.log(
          "WARNING: Posttest exists but no sourcePretest questions found"
        );
        posttestWithQuestions = {
          _id: posttest._id,
          title: posttest.title,
          description: posttest.description,
          duration: posttest.duration,
          passingScore: posttest.passingScore,
          questions: [],
          totalPoints: 0,
          error: "ไม่พบคำถามใน Pretest ต้นทาง",
        };
      }
    }

    // Prepare pretest without answers (only multiple-choice questions for students)
    let pretestWithoutAnswers = null;
    if (pretest) {
      const fullPretest = await PretestSheet.findById(pretest._id);
      // Filter to only multiple-choice questions for Pretest
      const mcQuestions = fullPretest.questions.filter(
        (q) => q.questionType === "multiple-choice" || !q.questionType
      );
      // Calculate totalPoints for filtered questions only
      const mcTotalPoints = mcQuestions.reduce(
        (sum, q) => sum + (q.points || 1),
        0
      );
      pretestWithoutAnswers = {
        _id: fullPretest._id,
        title: fullPretest.title,
        description: fullPretest.description,
        duration: fullPretest.duration,
        passingScore: fullPretest.passingScore,
        totalPoints: mcTotalPoints,
        questions: mcQuestions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          questionImage: q.questionImage,
          questionType: q.questionType,
          options: q.options,
          points: q.points,
        })),
      };
    }

    res.status(200).json({
      pretest: pretestWithoutAnswers,
      posttest: posttestWithQuestions,
      progress: {
        pretestCompleted: progress?.pretestCompleted || false,
        pretestPassed: pretestResult?.passed || false,
        videoWatched: progress?.videoWatched || false,
        videoProgress: progress?.videoProgress || 0,
        posttestCompleted: progress?.posttestCompleted || false,
        posttestPassed: posttestResult?.passed || false,
        isCompleted: progress?.isCompleted || false,
      },
      pretestResult: pretestResult
        ? {
            score: pretestResult.score,
            percentage: pretestResult.percentage,
            passed: pretestResult.passed,
          }
        : null,
      posttestResult: posttestResult
        ? {
            score: posttestResult.score,
            percentage: posttestResult.percentage,
            passed: posttestResult.passed,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching chapter tests:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Submit Pretest
const submitPretest = async (req, res) => {
  try {
    const studentId = req.userId;
    const { id: pretestId } = req.params;
    const { answers } = req.body; // { questionId: answer }

    console.log("=== Submit Pretest Debug ===");
    console.log("Student ID:", studentId);
    console.log("Pretest ID:", pretestId);

    // Validate studentId
    if (!studentId) {
      return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้" });
    }

    // Fetch pretest with correct answers
    const pretest = await PretestSheet.findById(pretestId);
    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    console.log("Pretest found:", pretest.title);
    console.log("Pretest chapter:", pretest.chapter);
    console.log("Pretest subject:", pretest.subject);

    // Validate required fields
    if (!pretest.chapter) {
      return res.status(400).json({ message: "แบบทดสอบไม่มี chapter" });
    }
    if (!pretest.subject) {
      return res.status(400).json({ message: "แบบทดสอบไม่มี subject" });
    }

    // Grade the test
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    // Only grade multiple-choice questions for Pretest
    const mcQuestions = pretest.questions.filter(
      (q) => q.questionType === "multiple-choice" || !q.questionType
    );

    mcQuestions.forEach((question) => {
      const studentAnswer = answers[question._id.toString()];
      const points = question.points || 1;
      maxScore += points;

      let isCorrect = false;
      let correctAnswer = null;

      if (question.questionType === "matching") {
        // For matching, check each pair using index-based answers (like admin)
        const studentPairs = studentAnswer || {};
        const correctPairs = question.matchingPairs || [];
        let matchingScore = 0;
        correctPairs.forEach((pair, idx) => {
          // Check index-based: studentPairs[idx] should equal pair.right
          if (
            studentPairs[idx] === pair.right ||
            studentPairs[idx.toString()] === pair.right
          ) {
            matchingScore++;
          }
        });
        isCorrect = matchingScore === correctPairs.length;
        if (isCorrect) totalScore += points;
        correctAnswer = correctPairs;
      } else if (question.questionType === "true-false") {
        // Handle Thai true-false answers: ถูก = true, ผิด = false
        const normalizedStudentAnswer =
          studentAnswer === "ถูก"
            ? "true"
            : studentAnswer === "ผิด"
            ? "false"
            : studentAnswer;
        const normalizedCorrectAnswer =
          question.correctAnswer?.toLowerCase?.() || question.correctAnswer;
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        if (isCorrect) totalScore += points;
        correctAnswer = question.correctAnswer;
      } else {
        // For multiple-choice and short-answer types
        // Normalize both answers: trim whitespace and compare
        const normalizedStudentAnswer = String(studentAnswer || "").trim();
        const normalizedCorrectAnswer = String(
          question.correctAnswer || ""
        ).trim();
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        if (isCorrect) totalScore += points;
        correctAnswer = question.correctAnswer;
      }

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        studentAnswer,
        correctAnswer: pretest.showCorrectAnswers ? correctAnswer : null,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points,
        explanation: pretest.showCorrectAnswers ? question.explanation : null,
      });
    });

    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= pretest.passingScore;

    // Save test result
    const testResult = new TestResult({
      student: studentId,
      chapter: pretest.chapter,
      subject: pretest.subject,
      testType: "pretest",
      testRef: pretestId,
      testModel: "PretestSheet",
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      answers: gradedAnswers.map((a, idx) => ({
        questionIndex: idx,
        questionText: a.questionText,
        userAnswer:
          typeof a.studentAnswer === "object"
            ? JSON.stringify(a.studentAnswer)
            : a.studentAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect,
        points: a.points,
      })),
    });
    await testResult.save();

    // Update student progress
    await StudentProgress.findOneAndUpdate(
      { student: studentId, chapter: pretest.chapter },
      {
        student: studentId,
        chapter: pretest.chapter,
        subject: pretest.subject,
        pretestCompleted: true,
        pretestScore: percentage,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "ส่งคำตอบสำเร็จ",
      score: totalScore,
      maxScore,
      percentage,
      passed,
      passingScore: pretest.passingScore,
      gradedAnswers: pretest.showCorrectAnswers ? gradedAnswers : null,
    });
  } catch (error) {
    console.error("Error submitting pretest:", error);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการส่งคำตอบ",
      error: error.message,
      details: error.name,
    });
  }
};

// Submit Posttest
const submitPosttest = async (req, res) => {
  try {
    const studentId = req.userId;
    const { id: posttestId } = req.params;
    const { answers, questionIds } = req.body; // questionIds = the actual questions that were shown

    // Fetch posttest
    let posttest = await PosttestSheet.findById(posttestId).populate(
      "sourcePretest"
    );
    if (!posttest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    // Auto-link: If posttest has no sourcePretest, find pretest from same chapter
    if (!posttest.sourcePretest && posttest.chapter) {
      console.log(
        "submitPosttest: Auto-linking to pretest for chapter:",
        posttest.chapter
      );
      const pretest = await PretestSheet.findOne({
        chapter: posttest.chapter,
        isActive: true,
      });
      if (pretest) {
        posttest.sourcePretest = pretest;
        console.log(
          "submitPosttest: Found pretest:",
          pretest._id,
          "with",
          pretest.questions?.length,
          "questions"
        );
      }
    }

    // Get the questions from source pretest
    const allQuestions = posttest.sourcePretest?.questions || [];
    console.log("submitPosttest: allQuestions count:", allQuestions.length);

    // Filter to only the questions that were shown
    const shownQuestions = questionIds
      ? allQuestions.filter((q) => questionIds.includes(q._id.toString()))
      : allQuestions.slice(0, posttest.questionCount || allQuestions.length);

    // Grade the test
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    shownQuestions.forEach((question) => {
      const studentAnswer = answers[question._id.toString()];
      const points = question.points || 1;
      maxScore += points;

      let isCorrect = false;
      let correctAnswer = null;

      if (question.questionType === "matching") {
        // For matching, check each pair using index-based answers (like admin)
        const studentPairs = studentAnswer || {};
        const correctPairs = question.matchingPairs || [];
        let matchingScore = 0;
        correctPairs.forEach((pair, idx) => {
          // Check index-based: studentPairs[idx] should equal pair.right
          if (
            studentPairs[idx] === pair.right ||
            studentPairs[idx.toString()] === pair.right
          ) {
            matchingScore++;
          }
        });
        isCorrect = matchingScore === correctPairs.length;
        if (isCorrect) totalScore += points;
        correctAnswer = correctPairs;
      } else if (question.questionType === "true-false") {
        // Handle Thai true-false answers: ถูก = true, ผิด = false
        const normalizedStudentAnswer =
          studentAnswer === "ถูก"
            ? "true"
            : studentAnswer === "ผิด"
            ? "false"
            : studentAnswer;
        const normalizedCorrectAnswer =
          question.correctAnswer?.toLowerCase?.() || question.correctAnswer;
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        if (isCorrect) totalScore += points;
        correctAnswer = question.correctAnswer;
      } else {
        // For multiple-choice and short-answer types
        // Normalize both answers: trim whitespace and compare
        const normalizedStudentAnswer = String(studentAnswer || "").trim();
        const normalizedCorrectAnswer = String(
          question.correctAnswer || ""
        ).trim();
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        if (isCorrect) totalScore += points;
        correctAnswer = question.correctAnswer;
      }

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        studentAnswer,
        correctAnswer: posttest.showCorrectAnswers ? correctAnswer : null,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points,
        explanation: posttest.showCorrectAnswers ? question.explanation : null,
      });
    });

    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= posttest.passingScore;

    // Save test result
    const testResult = new TestResult({
      student: studentId,
      chapter: posttest.chapter,
      subject: posttest.subject,
      testType: "posttest",
      testRef: posttestId,
      testModel: "PosttestSheet",
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      answers: gradedAnswers.map((a, idx) => ({
        questionIndex: idx,
        questionText: a.questionText,
        userAnswer:
          typeof a.studentAnswer === "object"
            ? JSON.stringify(a.studentAnswer)
            : a.studentAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect,
        points: a.points,
      })),
    });
    await testResult.save();

    // Update student progress
    const progressUpdate = {
      student: studentId,
      chapter: posttest.chapter,
      subject: posttest.subject,
      posttestCompleted: true,
      posttestScore: percentage,
    };

    // If passed, mark chapter as completed
    if (passed) {
      progressUpdate.isCompleted = true;
    }

    await StudentProgress.findOneAndUpdate(
      { student: studentId, chapter: posttest.chapter },
      progressUpdate,
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: passed ? "🎉 ยินดีด้วย! คุณผ่านแบบทดสอบแล้ว" : "ส่งคำตอบสำเร็จ",
      score: totalScore,
      maxScore,
      percentage,
      passed,
      passingScore: posttest.passingScore,
      chapterCompleted: passed,
      gradedAnswers: posttest.showCorrectAnswers ? gradedAnswers : null,
    });
  } catch (error) {
    console.error("Error submitting posttest:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการส่งคำตอบ",
      error: error.message,
    });
  }
};

// Get all chapters progress with lock status for sequential learning
const getAllChaptersProgress = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get all chapters ordered by createdAt
    const chapters = await Chapter.find()
      .sort({ createdAt: 1 })
      .populate("subject", "subject_name code")
      .lean();

    // Get student's progress for all chapters
    const progressRecords = await StudentProgress.find({
      student: studentId,
    }).lean();

    // Get all posttest results for student
    const posttestResults = await TestResult.find({
      student: studentId,
      testType: "posttest",
    }).lean();

    // Create progress map for quick lookup
    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.chapter?.toString()] = p;
    });

    // Create posttest results map
    const posttestMap = {};
    posttestResults.forEach((r) => {
      const chapterId = r.chapter?.toString();
      // Keep the best result (passed = true has priority)
      if (
        !posttestMap[chapterId] ||
        r.passed ||
        r.percentage > (posttestMap[chapterId]?.percentage || 0)
      ) {
        posttestMap[chapterId] = r;
      }
    });

    // Build chapters with progress and lock status
    const chaptersWithProgress = chapters.map((chapter, index) => {
      const chapterId = chapter._id.toString();
      const progress = progressMap[chapterId];
      const posttestResult = posttestMap[chapterId];

      // Determine lock status
      // Chapter 1 (index 0) is always unlocked
      // Subsequent chapters require previous chapter's posttest to be passed
      let isUnlocked = index === 0;
      let lockReason = null;

      if (index > 0) {
        const prevChapterId = chapters[index - 1]._id.toString();
        const prevPosttestResult = posttestMap[prevChapterId];
        isUnlocked = prevPosttestResult?.passed === true;

        if (!isUnlocked) {
          lockReason = `ต้องผ่าน Posttest ของ ${
            chapters[index - 1].chapter_name
          } ก่อน`;
        }
      }

      return {
        _id: chapter._id,
        chapter_name: chapter.chapter_name,
        description: chapter.description,
        order: index + 1,
        hasVideo: !!chapter.video_url,
        hasDocument: !!chapter.document_url,
        subject: chapter.subject,
        isUnlocked,
        lockReason,
        progress: {
          pretestCompleted: progress?.pretestCompleted || false,
          videoWatched: progress?.videoWatched || false,
          videoProgress: progress?.videoProgress || 0,
          posttestCompleted: progress?.posttestCompleted || false,
          posttestPassed: posttestResult?.passed || false,
          isCompleted: progress?.isCompleted || false,
        },
      };
    });

    res.status(200).json({
      chapters: chaptersWithProgress,
    });
  } catch (error) {
    console.error("Error fetching chapters progress:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Get Final Exam for student (checks if all 6 chapters completed)
const FinalExam = require("../progress/finalExam.model");

const getFinalExamForStudent = async (req, res) => {
  try {
    const studentId = req.userId;
    const { subjectId } = req.params;

    // Get all chapters for subject
    const chapters = await Chapter.find({ subject: subjectId }).lean();
    const totalChapters = chapters.length;

    // Get student's progress for all chapters
    const progressRecords = await StudentProgress.find({
      student: studentId,
      subject: subjectId,
    }).lean();

    // Count completed chapters (posttestPassed = true)
    const posttestResults = await TestResult.find({
      student: studentId,
      subject: subjectId,
      testType: "posttest",
      passed: true,
    }).lean();

    const completedChapters = new Set(
      posttestResults.map((r) => r.chapter?.toString())
    ).size;

    const canTakeFinalExam =
      completedChapters >= totalChapters && totalChapters > 0;

    // Get Final Exam
    const finalExam = await FinalExam.findOne({
      subject: subjectId,
      isActive: true,
    }).lean();

    if (!finalExam) {
      return res.status(200).json({
        canTakeFinalExam,
        completedChapters,
        totalChapters,
        finalExam: null,
        message: "ยังไม่มีข้อสอบสุดท้ายสำหรับวิชานี้",
      });
    }

    // Count all attempts for this exam
    const allAttempts = await TestResult.find({
      student: studentId,
      testRef: finalExam._id,
      testType: "final",
    })
      .sort({ createdAt: -1 })
      .lean();

    const attemptCount = allAttempts.length;
    const maxAttempts = 3;
    const latestAttempt = allAttempts[0] || null;

    // Check if already passed or max attempts reached
    const hasPassed = allAttempts.some((a) => a.passed === true);
    const canRetake = !hasPassed && attemptCount < maxAttempts;

    // Prepare questions without answers but with images
    const questionsWithoutAnswers = finalExam.questions.map((q) => {
      let answerOptions = null;
      if (q.questionType === "matching" && q.matchingPairs) {
        answerOptions = q.matchingPairs
          .map((p) => p.right)
          .sort(() => Math.random() - 0.5);
      }
      return {
        _id: q._id,
        questionText: q.questionText,
        questionImage: q.questionImage, // Include question image
        questionType: q.questionType,
        options: q.options,
        points: q.points,
        matchingPairs: q.matchingPairs?.map((p) => ({
          left: p.left,
          leftImage: p.leftImage,
        })),
        answerOptions,
      };
    });

    res.status(200).json({
      canTakeFinalExam,
      completedChapters,
      totalChapters,
      attemptCount,
      maxAttempts,
      canRetake,
      alreadyTaken: attemptCount > 0,
      previousResult: latestAttempt
        ? {
            testResultId: latestAttempt._id,
            percentage: latestAttempt.percentage,
            passed: latestAttempt.passed,
          }
        : null,
      finalExam: {
        _id: finalExam._id,
        title: finalExam.title,
        description: finalExam.description,
        duration: finalExam.duration,
        passingScore: finalExam.passingScore,
        questions: questionsWithoutAnswers,
        totalPoints: finalExam.totalPoints,
      },
    });
  } catch (error) {
    console.error("Error getting final exam:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

// Submit Final Exam
const submitFinalExam = async (req, res) => {
  try {
    const studentId = req.userId;
    const { id: examId } = req.params;
    const { answers } = req.body;

    const finalExam = await FinalExam.findById(examId);
    if (!finalExam) {
      return res.status(404).json({ message: "ไม่พบข้อสอบ" });
    }

    // Check attempt count (max 3 attempts)
    const maxAttempts = 3;
    const existingAttempts = await TestResult.find({
      student: studentId,
      testRef: examId,
      testType: "final",
    }).lean();

    const hasPassed = existingAttempts.some((a) => a.passed === true);
    if (hasPassed) {
      return res.status(400).json({
        message: "คุณผ่านข้อสอบนี้แล้ว ไม่สามารถทำซ้ำได้",
      });
    }

    if (existingAttempts.length >= maxAttempts) {
      return res.status(400).json({
        message: `คุณใช้สิทธิ์สอบครบ ${maxAttempts} ครั้งแล้ว`,
        attemptCount: existingAttempts.length,
        maxAttempts,
      });
    }

    // Grade the exam
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    finalExam.questions.forEach((question) => {
      const studentAnswer = answers[question._id.toString()];
      const points = question.points || 1;
      maxScore += points;

      let isCorrect = false;
      let correctAnswer = null;

      if (question.questionType === "matching") {
        const studentPairs = studentAnswer || {};
        const correctPairs = question.matchingPairs || [];
        let matchingScore = 0;
        correctPairs.forEach((pair, idx) => {
          if (
            studentPairs[idx] === pair.right ||
            studentPairs[idx.toString()] === pair.right
          ) {
            matchingScore++;
          }
        });
        isCorrect = matchingScore === correctPairs.length;
        if (isCorrect) totalScore += points;
        correctAnswer = correctPairs;
      } else if (question.questionType === "true-false") {
        // Handle Thai true-false answers: ถูก = true, ผิด = false
        const normalizedStudentAnswer =
          studentAnswer === "ถูก"
            ? "true"
            : studentAnswer === "ผิด"
            ? "false"
            : studentAnswer;
        const normalizedCorrectAnswer =
          question.correctAnswer?.toLowerCase?.() || question.correctAnswer;
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        if (isCorrect) totalScore += points;
        correctAnswer = question.correctAnswer;
      } else {
        // For multiple-choice and short-answer types
        // Normalize both answers: trim whitespace and compare
        const normalizedStudentAnswer = String(studentAnswer || "").trim();
        const normalizedCorrectAnswer = String(
          question.correctAnswer || ""
        ).trim();
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        if (isCorrect) totalScore += points;
        correctAnswer = question.correctAnswer;
      }

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        studentAnswer,
        correctAnswer: finalExam.showCorrectAnswers ? correctAnswer : null,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points,
      });
    });

    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= finalExam.passingScore;

    // Save result
    const testResult = new TestResult({
      student: studentId,
      subject: finalExam.subject,
      testType: "final",
      testRef: examId,
      testModel: "FinalExam",
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      answers: gradedAnswers.map((a, idx) => ({
        questionIndex: idx,
        questionText: a.questionText,
        userAnswer:
          typeof a.studentAnswer === "object"
            ? JSON.stringify(a.studentAnswer)
            : a.studentAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect,
        points: a.points,
      })),
    });
    await testResult.save();

    res.status(200).json({
      message: passed
        ? "🎉 ยินดีด้วย! คุณผ่านข้อสอบสุดท้ายแล้ว"
        : "ส่งคำตอบสำเร็จ",
      score: totalScore,
      maxScore,
      percentage,
      passed,
      passingScore: finalExam.passingScore,
      gradedAnswers: finalExam.showCorrectAnswers ? gradedAnswers : null,
      testResultId: testResult._id,
    });
  } catch (error) {
    console.error("Error submitting final exam:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

// Get my test results (pretest & posttest only)
const getMyTestResults = async (req, res) => {
  try {
    const studentId = req.userId;
    const { testType } = req.query; // optional filter: pretest, posttest

    // Build query - exclude final exam
    const query = {
      student: studentId,
      testType: { $in: ["pretest", "posttest"] },
    };

    // If specific test type filter
    if (testType && ["pretest", "posttest"].includes(testType)) {
      query.testType = testType;
    }

    const results = await TestResult.find(query)
      .populate("subject", "subject_name code")
      .populate("chapter", "chapter_name")
      .sort({ submittedAt: -1 })
      .lean();

    // Group by chapter for better display
    const groupedResults = {};
    results.forEach((result) => {
      const chapterId = result.chapter?._id?.toString() || "unknown";
      if (!groupedResults[chapterId]) {
        groupedResults[chapterId] = {
          chapter: result.chapter,
          subject: result.subject,
          pretest: null,
          posttest: null,
        };
      }
      if (result.testType === "pretest") {
        // Keep the latest result
        if (
          !groupedResults[chapterId].pretest ||
          new Date(result.submittedAt) >
            new Date(groupedResults[chapterId].pretest.submittedAt)
        ) {
          groupedResults[chapterId].pretest = result;
        }
      } else if (result.testType === "posttest") {
        if (
          !groupedResults[chapterId].posttest ||
          new Date(result.submittedAt) >
            new Date(groupedResults[chapterId].posttest.submittedAt)
        ) {
          groupedResults[chapterId].posttest = result;
        }
      }
    });

    res.status(200).json({
      results,
      grouped: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Get my final exam results
const getMyFinalResults = async (req, res) => {
  try {
    const studentId = req.userId;

    const results = await TestResult.find({
      student: studentId,
      testType: "final",
    })
      .populate("subject", "subject_name code")
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error fetching final exam results:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// ========== Worksheet APIs ==========
const Worksheet = require("../worksheet/worksheet.model");
const WorksheetSubmission = require("../worksheet/worksheetSubmission.model");
const { uploadFile, getObjectUrl } = require("../services/s3.service");

// Get all worksheets for student
const getMyWorksheets = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get all active worksheets
    const worksheets = await Worksheet.find({ isActive: true })
      .populate("chapter", "chapter_name")
      .sort({ createdAt: -1 })
      .lean();

    // Get student's submissions with team members populated
    const submissions = await WorksheetSubmission.find({
      $or: [{ student: studentId }, { teamMembers: studentId }],
    })
      .populate("teamMembers", "firstName lastName profileImage")
      .lean();

    // Map submissions by worksheet ID
    const submissionMap = {};
    submissions.forEach((sub) => {
      submissionMap[sub.worksheet.toString()] = sub;
    });

    // Combine worksheet with submission status
    const result = worksheets.map((ws) => {
      const submission = submissionMap[ws._id.toString()];
      return {
        ...ws,
        submission: submission || null,
        status: submission ? submission.status : "pending", // pending, submitted, graded
      };
    });

    res.status(200).json({ worksheets: result });
  } catch (error) {
    console.error("Error fetching worksheets:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Submit worksheet (file upload)
const submitWorksheet = async (req, res) => {
  try {
    const studentId = req.userId;
    const { id: worksheetId } = req.params;
    const { teamMembers } = req.body; // Array of student IDs

    // Check worksheet exists
    const worksheet = await Worksheet.findById(worksheetId);
    if (!worksheet) {
      return res.status(404).json({ message: "ไม่พบใบงาน" });
    }

    // Check if file uploaded
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์" });
    }

    // Check deadline
    if (worksheet.deadline && new Date() > new Date(worksheet.deadline)) {
      return res.status(400).json({ message: "หมดเขตส่งงานแล้ว" });
    }

    // Upload file to S3
    const file = req.file;
    const fileExt = file.originalname.split(".").pop().toLowerCase();
    const key = `submissions/${studentId}/${worksheetId}/${Date.now()}-${
      file.originalname
    }`;

    const { url } = await uploadFile(file.buffer, key, file.mimetype);

    // Determine file type
    let fileType = "other";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
      fileType = "image";
    } else if (fileExt === "pdf") {
      fileType = "pdf";
    } else if (["doc", "docx"].includes(fileExt)) {
      fileType = "doc";
    }

    // Parse teamMembers if string
    let parsedTeamMembers = [];
    if (teamMembers) {
      try {
        parsedTeamMembers =
          typeof teamMembers === "string"
            ? JSON.parse(teamMembers)
            : teamMembers;
      } catch (e) {
        parsedTeamMembers = [];
      }
    }

    // Check existing submission
    let submission = await WorksheetSubmission.findOne({
      student: studentId,
      worksheet: worksheetId,
    });

    if (submission) {
      // Update existing
      submission.fileUrl = url;
      submission.fileType = fileType;
      submission.fileName = file.originalname;
      submission.status = "submitted";
      submission.submittedAt = new Date();
      submission.teamMembers = parsedTeamMembers;
      await submission.save();
    } else {
      // Create new
      submission = new WorksheetSubmission({
        student: studentId,
        worksheet: worksheetId,
        fileUrl: url,
        fileType,
        fileName: file.originalname,
        status: "submitted",
        submittedAt: new Date(),
        teamMembers: parsedTeamMembers,
      });
      await submission.save();
    }

    res.status(200).json({
      message: "ส่งงานสำเร็จ!",
      submission,
    });
  } catch (error) {
    console.error("Error submitting worksheet:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการส่งงาน",
      error: error.message,
    });
  }
};

// Get my submissions
const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.userId;

    const submissions = await WorksheetSubmission.find({
      $or: [{ student: studentId }, { teamMembers: studentId }],
    })
      .populate({
        path: "worksheet",
        select: "title description deadline chapter",
        populate: { path: "chapter", select: "chapter_name" },
      })
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

module.exports = {
  loginStudent,
  getChapterFullVideo,
  getProfile,
  updateProfile,
  changePassword,
  getChapterProgress,
  updateVideoProgress,
  markVideoComplete,
  getMyProgress,
  getChapterTests,
  submitPretest,
  submitPosttest,
  getAllChaptersProgress,
  getFinalExamForStudent,
  submitFinalExam,

  getMyTestResults,
  getMyFinalResults,
  getMyWorksheets,
  submitWorksheet,
  getMySubmissions,
};

// Get classmates (same classroom) - exported separately
module.exports.getClassmates = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get current student's classroom
    const currentStudent = await Student.findById(studentId)
      .select("classRoom")
      .lean();
    if (!currentStudent) {
      return res.status(404).json({ message: "ไม่พบข้อมูลนักเรียน" });
    }

    // Get all students in the same classroom (excluding self)
    const classmates = await Student.find({
      classRoom: currentStudent.classRoom,
      _id: { $ne: studentId },
    })
      .select("firstName lastName profileImage")
      .sort({ firstName: 1 })
      .lean();

    res.status(200).json({ classmates, classRoom: currentStudent.classRoom });
  } catch (error) {
    console.error("Error fetching classmates:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Get student notifications (personal + global)
module.exports.getMyNotifications = async (req, res) => {
  try {
    const studentId = req.userId;
    const Notification = require("../notification/notification.model");

    // Get personal notifications for this student AND global notifications
    const notifications = await Notification.find({
      $or: [
        { recipient: studentId, isGlobal: false },
        { isGlobal: true, isActive: true },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};
