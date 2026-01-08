const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For development, use console logging
  // For production, configure with real SMTP settings
  if (process.env.NODE_ENV === 'development') {
    return {
      sendMail: async (mailOptions) => {
        console.log('\n📧 ========== EMAIL SENT ==========');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Message:\n', mailOptions.text);
        console.log('=====================================\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  // Production email configuration (uncomment and configure when ready)
  /*
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  */
};

// Send welcome email to new student
exports.sendWelcomeEmail = async (studentData) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PayMyHostel <noreply@paymyhostel.com>',
    to: studentData.email,
    subject: 'Welcome to PayMyHostel! 🏠',
    text: `
Welcome to PayMyHostel!

Dear ${studentData.fullName},

Your account has been successfully created. Here are your details:

Student ID: ${studentData.studentId}
Hostel Block: ${studentData.hostelBlock}
Room Number: ${studentData.roomNumber}
Email: ${studentData.email}

HOSTEL PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank Name:       BOC
Branch:          Matara
Account Number:  1753466
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monthly Fee: Rs. 20,000

Please make your monthly payment and upload the bank slip through your student dashboard.

Login to your account at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

If you have any questions, feel free to contact us.

Best regards,
PayMyHostel Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: 600; color: #003D7A; }
    .bank-details { background: #003D7A; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .bank-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to PayMyHostel! 🏠</h1>
    </div>
    <div class="content">
      <h2>Hello ${studentData.fullName},</h2>
      <p>Your account has been successfully created. Here are your details:</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Student ID:</span>
          <span>${studentData.studentId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hostel Block:</span>
          <span>${studentData.hostelBlock}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room Number:</span>
          <span>${studentData.roomNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span>${studentData.email}</span>
        </div>
      </div>

      <div class="bank-details">
        <h3 style="margin-top: 0;">Hostel Payment Details</h3>
        <div class="bank-row">
          <strong>Bank Name:</strong>
          <span>BOC</span>
        </div>
        <div class="bank-row">
          <strong>Branch:</strong>
          <span>Matara</span>
        </div>
        <div class="bank-row">
          <strong>Account Number:</strong>
          <span>1753466</span>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
          <div class="bank-row">
            <strong>Monthly Fee:</strong>
            <span style="font-size: 18px;">Rs. 20,000</span>
          </div>
        </div>
      </div>

      <p>Please make your monthly payment and upload the bank slip through your student dashboard.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
           style="background: #003D7A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login to Your Account
        </a>
      </p>

      <p>If you have any questions, feel free to contact us.</p>
      
      <p>Best regards,<br><strong>PayMyHostel Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', studentData.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation email
exports.sendPaymentConfirmation = async (paymentData, studentData) => {
  const transporter = createTransporter();
  
  const statusMessage = paymentData.status === 'success' 
    ? 'Your payment has been approved!' 
    : 'Your payment is pending review.';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PayMyHostel <noreply@paymyhostel.com>',
    to: studentData.email,
    subject: `Payment ${paymentData.status === 'success' ? 'Approved' : 'Received'} - ${paymentData.reference}`,
    text: `
Dear ${studentData.fullName},

${statusMessage}

Payment Details:
Reference: ${paymentData.reference}
Amount: Rs. ${paymentData.amount}
Month: ${paymentData.month || 'N/A'}
Year: ${paymentData.year || 'N/A'}
Status: ${paymentData.status.toUpperCase()}

${paymentData.adminNotes ? `Admin Notes: ${paymentData.adminNotes}` : ''}

Thank you for using PayMyHostel.

Best regards,
PayMyHostel Team
    `,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1>Payment ${paymentData.status === 'success' ? 'Approved' : 'Received'} ✓</h1>
    </div>
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
      <h2>Dear ${studentData.fullName},</h2>
      <p style="font-size: 16px; color: #003D7A; font-weight: bold;">${statusMessage}</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details</h3>
        <p><strong>Reference:</strong> ${paymentData.reference}</p>
        <p><strong>Amount:</strong> Rs. ${paymentData.amount}</p>
        <p><strong>Month:</strong> ${paymentData.month || 'N/A'}</p>
        <p><strong>Year:</strong> ${paymentData.year || 'N/A'}</p>
        <p><strong>Status:</strong> <span style="color: ${paymentData.status === 'success' ? 'green' : 'orange'}; font-weight: bold;">${paymentData.status.toUpperCase()}</span></p>
        ${paymentData.adminNotes ? `<p><strong>Admin Notes:</strong> ${paymentData.adminNotes}</p>` : ''}
      </div>

      <p>Thank you for using PayMyHostel.</p>
      <p>Best regards,<br><strong>PayMyHostel Team</strong></p>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Payment confirmation email sent to:', studentData.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending payment confirmation:', error.message);
    return { success: false, error: error.message };
  }
};
