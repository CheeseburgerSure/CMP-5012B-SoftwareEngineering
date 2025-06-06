const pool = require('../db');
const { sendEmail } = require('./email');

// Handles the payment page and payment processing
const getPaymentPage = async (req, res) => {
  const { booking_id } = req.params;
  const email = req.session.user?.email; 

  if (!email) return res.redirect('/login');

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // gets user info from db
    const user = userRes.rows[0];

    const bookingRes = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [booking_id]); // using booking_id to get booking info
    const booking = bookingRes.rows[0];
    
    // booking cost and user balance
    const price = parseFloat(booking.price);
    const balance = parseFloat(user.balance);

    // formatted date
    const rawDate = new Date(booking.booking_date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = rawDate.toLocaleDateString('en-GB', options); 

    // sends data to the payment page, for the user to see
    res.render('payment', {
      user,
      booking,
      price,
      balance,
      canPay: balance >= price,
      formattedDate
    });
  } catch (err) {
    console.error('Error loading payment page:', err);
    res.status(500).send('Error loading payment page.');
  }
};

// Payment processing handler
const postPay = async (req, res) => {
  const { booking_id } = req.params; // gets booking_id 
  const email = req.session.user?.email; // checks if user is logged in

  if (!email) return res.redirect('/login');

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    const bookingRes = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [booking_id]);
    const booking = bookingRes.rows[0];

    const price = parseFloat(booking.price);
    const balance = parseFloat(user.balance);

    if (balance < price) {
      return res.status(400).send('Insufficient balance.'); // If user doesn't have enough money
    }

    // Deduct balance and update booking
    await pool.query('UPDATE users SET balance = balance - $1 WHERE user_id = $2', [price, user.user_id]);
    await pool.query('UPDATE bookings SET booking_paid = true WHERE booking_id = $1', [booking_id]);
    await pool.query('INSERT INTO transactions (user_id, amount) VALUES ($1, $2)', [user.user_id, price]);

    /// Formatted date
    const rawDate = new Date(booking.booking_date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = rawDate.toLocaleDateString('en-GB', options);

    // email message
    const msg = `
    Hi ${user.first_name},

    You booking has been confirmed, further details are listed below:

    Location: ${booking.location}
    Date: ${formattedDate}
    Time: ${booking.time_booked_for}
    Amount Paid: £${price.toFixed(2)}

    Thank you for choosing ParkFlow!
   `;

    // Sends the confirmation email
    await sendEmail(user.email, 'Booking Confirmation - ParkFlow', msg);
    console.log(`Email sent to ${user.email}`);

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).send('Payment processing failed.');
  }
};

module.exports = { getPaymentPage, postPay };
