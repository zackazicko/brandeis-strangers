// sendGridClient.js - Client-side JavaScript for handling email verification
export async function sendEmailVerification(to, code) {
    try {
        const response = await fetch('http://localhost:3001/api/emails/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: to,
                subject: 'Your Brandeis Meal Match Verification Code',
                text: `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this code, please ignore this email.`
            })
        });
        const result = await response.json();
        if (response.ok) {
            console.log('Email sent successfully:', result);
            return result;
        } else {
            throw new Error(`Failed to send email: ${result.message}`);
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

