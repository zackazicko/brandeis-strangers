const express = require('express');
const sgMail = require('@sendgrid/mail');
const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);  // Ensure your SENDGRID_API_KEY is in your environment variables

// Define endpoint for sending emails
router.post('/send', async (req, res) => {
    const { to, subject, text } = req.body;  // Extracting email details from request body
    const msg = {
        to,
        from: 'strangersbrandeis@gmail.com',  // Use your verified SendGrid sender email
        subject,
        text,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

module.exports = router;
