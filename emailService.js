import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendReferralEmail = async (referrerEmail, refereeEmail) => {
    try {
        if (!referrerEmail || !refereeEmail) {
            console.error("❌ Error: Missing email addresses.");
            return;
        }

        console.log("📧 Sending email to:", refereeEmail);

        const mailOptions = {
            from: `"Referral Program" <${process.env.EMAIL_USER}>`,
            to: refereeEmail,
            subject: "You've Been Referred! 🎉",
            html: `
                <p>Hello,</p>
                <p>You have been referred by <strong>${referrerEmail}</strong>.</p>
                <p>Join now and earn exciting rewards! 🎁</p>
                <p>Click <a href="https://yourwebsite.com">here</a> to get started.</p>
                <br>
                <p>Best regards,<br>Your Company Team</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response);
    } catch (error) {
        console.error("❌ Error sending referral email:", error.message);
    }
};
