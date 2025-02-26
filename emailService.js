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
        console.log("📧 Sending email to:", refereeEmail);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: refereeEmail,
            subject: "You've Been Referred!",
            text: `Hello, You have been referred by ${referrerEmail}. Join now and earn exciting rewards!`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(" Email sent successfully:", info.response);
    } catch (error) {
        console.error(" Error sending referral email:", error);
    }
};
