const ContactMessage = require("../Models/ContactMessage");
const { sendContactEmail } = require("../Utils/mailer");

/**
 * POST: Handle Contact Us Form Submissions
 */
const postContactForm = async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message) {
      if (
        req.xhr ||
        (req.headers.accept && req.headers.accept.includes("json"))
      ) {
        return res.status(400).json({
          success: false,
          error: "Please fill in all required fields (Name, Email, Message).",
        });
      }
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/#contact");
    }

    // 1. Save message to MongoDB
    const contactRecord = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject ? subject.trim() : `Contact Inquiry from ${name.trim()}`,
      message: message.trim(),
    });

    // 2. Send email notification to rathodshubham7711@gmail.com
    const emailSent = await sendContactEmail({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: contactRecord.subject,
      message: message.trim(),
    });

    if (emailSent) {
      contactRecord.emailSent = true;
      await contactRecord.save();
    }

    if (
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes("json"))
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Thank you! Your message has been received and sent to Shubham.",
      });
    }

    req.flash("success", "Thank you! Your message has been sent successfully.");
    res.redirect("/#contact");
  } catch (err) {
    console.error("Contact submission error:", err);
    if (
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes("json"))
    ) {
      return res.status(500).json({
        success: false,
        error: "Failed to process your message. Please try again.",
      });
    }
    req.flash("error", "An error occurred while submitting your message.");
    res.redirect("/#contact");
  }
};

module.exports = {
  postContactForm,
};
