const response = await fetch('http://localhost:3001/api/tools/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'master@eburon.ai',
    subject: "You're Invited: Real Estate Viewing",
    body: `Dear Valued Client,

We are excited to invite you to an exclusive real estate viewing.

Property Details:
- Location: Brussels, Belgium
- Date: To be scheduled at your convenience
- Features: Modern apartment with garden view

Please reply to this email or call us to confirm your preferred date and time.

We look forward to showing you around!

Best regards,
Eburon AI Assistant
csr@eburon.ai`
  })
});

const data = await response.json();
console.log('Response:', JSON.stringify(data, null, 2));