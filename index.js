import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import prisma from "./prismaClient.js";
import { sendReferralEmail } from "./emailService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


async function testDBConnection() {
    try {
        await prisma.$connect();
        console.log(" Successfully connected to MySQL database!");
    } catch (error) {
        console.error(" Database connection failed:", error);
        process.exit(1); 
    }
}
testDBConnection();


app.post("/refer", async (req, res) => {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        
        const referral = await prisma.referral.create({
            data: { referrerName, referrerEmail, refereeName, refereeEmail },
        });

        console.log(" Referral saved, sending email...");

        
        await sendReferralEmail(referrerEmail, refereeEmail);

        console.log(" Email should be sent!");

        res.status(201).json({ message: "Referral submitted successfully", referral });
    } catch (error) {
        console.error(" Error saving referral:", error);
        res.status(500).json({ error: "Error saving referral", details: error.message });
    }
});



app.get("/test-db", async (req, res) => {
    try {
        const referrals = await prisma.referral.findMany();
        res.json({ success: true, data: referrals });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));