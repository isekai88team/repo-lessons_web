const Enrollment = require("./enrollment.model");
const StudentProgress = require("./studentProgress.model");
const TestResult = require("./testResult.model");
const FinalExam = require("./finalExam.model");
const Student = require("../student/student.model");
const Subject = require("../subject/subject.model");
const Chapter = require("../chapter/chapter.model");

// Get all students with their enrollment summary
const getAllStudentsProgress = async (req, res) => {
  try {
    const students = await Student.find().lean();

    // Get enrollment counts for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ student: student._id })
          .populate("subject", "subject_name code")
          .lean();

        // Calculate overall progress
        let totalProgress = 0;
        let completedSubjects = 0;

        for (const enrollment of enrollments) {
          const chapters = await Chapter.find({
            subject: enrollment.subject._id,
          }).lean();
          const progressRecords = await StudentProgress.find({
            student: student._id,
            subject: enrollment.subject._id,
          }).lean();

          const completedChapters = progressRecords.filter(
            (p) => p.isCompleted
          ).length;
          const subjectProgress =
            chapters.length > 0
              ? Math.round((completedChapters / chapters.length) * 100)
              : 0;

          enrollment.progress = subjectProgress;
          enrollment.completedChapters = completedChapters;
          enrollment.totalChapters = chapters.length;

          totalProgress += subjectProgress;
          if (enrollment.status === "completed") completedSubjects++;
        }

        return {
          ...student,
          enrollments,
          enrolledSubjects: enrollments.length,
          completedSubjects,
          averageProgress:
            enrollments.length > 0
              ? Math.round(totalProgress / enrollments.length)
              : 0,
        };
      })
    );

    res.status(200).json({ students: studentsWithProgress });
  } catch (error) {
    console.error("Error fetching students progress:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Get detailed progress for a specific student
const getStudentDetailedProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: "ไม่พบนักเรียน" });
    }

    // Get all enrollments
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "subject",
        populate: { path: "teacher", select: "firstName lastName" },
      })
      .lean();

    // Also get all StudentProgress records (may include subjects not formally enrolled)
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

    // Get enrolled subject IDs
    const enrolledSubjectIds = enrollments.map((e) => e.subject._id.toString());

    // Find subjects that have progress but are not enrolled
    const unenrolledSubjectIds = progressSubjectIds.filter(
      (id) => !enrolledSubjectIds.includes(id)
    );

    // Fetch unenrolled subjects
    const unenrolledSubjects = await Subject.find({
      _id: { $in: unenrolledSubjectIds },
    })
      .populate("teacher", "firstName lastName")
      .lean();

    // Create combined list: enrolled + unenrolled with progress
    const allSubjectData = [
      ...enrollments.map((e) => ({
        subject: e.subject,
        enrollment: e,
        isEnrolled: true,
      })),
      ...unenrolledSubjects.map((s) => ({
        subject: s,
        enrollment: null,
        isEnrolled: false,
      })),
    ];

    // Process each subject
    const subjectsProgress = await Promise.all(
      allSubjectData.map(async ({ subject, enrollment, isEnrolled }) => {
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

        // Calculate subject progress - use video progress average instead of isCompleted only
        const completedChapters = chaptersProgress.filter(
          (c) => c.progress.isCompleted
        ).length;

        // Count chapters with video watched (even if not fully completed)
        const videoWatchedChapters = chaptersProgress.filter(
          (c) => c.progress.videoWatched || c.progress.videoProgress === 100
        ).length;

        // Calculate average video progress across all chapters
        const averageVideoProgress =
          chaptersProgress.length > 0
            ? Math.round(
                chaptersProgress.reduce(
                  (sum, c) => sum + (c.progress.videoProgress || 0),
                  0
                ) / chaptersProgress.length
              )
            : 0;

        // Subject progress: weighted average (video progress is main indicator)
        const subjectProgress = chapters.length > 0 ? averageVideoProgress : 0;

        // Check if final exam is available
        const finalExam = await FinalExam.findOne({
          subject: subject._id,
        }).lean();
        const canTakeFinalExam =
          completedChapters === chapters.length && chapters.length > 0;

        // Get final exam result if completed
        const finalExamResult = await TestResult.findOne({
          student: studentId,
          subject: subject._id,
          testType: "final",
        })
          .sort({ submittedAt: -1 })
          .lean();

        return {
          enrollment: enrollment
            ? {
                _id: enrollment._id,
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
                finalExamCompleted: enrollment.finalExamCompleted,
                finalExamScore: enrollment.finalExamScore,
                finalExamPercentage: enrollment.finalExamPercentage,
              }
            : {
                _id: null,
                status: "not-enrolled",
                enrolledAt: null,
                completedAt: null,
              },
          isEnrolled,
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
    console.error("Error fetching student progress:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Enroll a student to a subject (Admin action)
const enrollStudent = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: studentId,
      subject: subjectId,
    });
    if (existing) {
      return res.status(400).json({ message: "นักเรียนลงทะเบียนวิชานี้แล้ว" });
    }

    const enrollment = new Enrollment({
      student: studentId,
      subject: subjectId,
    });

    await enrollment.save();

    // Create initial progress records for all chapters
    const chapters = await Chapter.find({ subject: subjectId });
    const progressRecords = chapters.map((chapter) => ({
      student: studentId,
      subject: subjectId,
      chapter: chapter._id,
    }));

    if (progressRecords.length > 0) {
      await StudentProgress.insertMany(progressRecords);
    }

    res.status(201).json({
      message: "ลงทะเบียนสำเร็จ",
      enrollment,
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการลงทะเบียน",
      error: error.message,
    });
  }
};

// Unenroll a student from a subject
const unenrollStudent = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    await Enrollment.findOneAndDelete({
      student: studentId,
      subject: subjectId,
    });

    // Also delete progress records
    await StudentProgress.deleteMany({
      student: studentId,
      subject: subjectId,
    });

    res.status(200).json({ message: "ยกเลิกการลงทะเบียนสำเร็จ" });
  } catch (error) {
    console.error("Error unenrolling student:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

// Get test history for a student
const getStudentTestHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { testType, subjectId } = req.query;

    const query = { student: studentId };
    if (testType) query.testType = testType;
    if (subjectId) query.subject = subjectId;

    const results = await TestResult.find(query)
      .populate("subject", "subject_name code")
      .populate("chapter", "chapter_name")
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error fetching test history:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudentsProgress,
  getStudentDetailedProgress,
  enrollStudent,
  unenrollStudent,
  getStudentTestHistory,
};
