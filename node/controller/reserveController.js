const pool = require('../db');

const getReservePage = async (req, res) => {
  try {
    // list of all parking lots
    const lotRes = await pool.query('SELECT * FROM parking_lots');
    const lots = lotRes.rows;

    // Todays date  
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Booking counts for today
    const bookingCounts = await pool.query(`
      SELECT location, COUNT(*) AS occupied_today
      FROM bookings
      WHERE booking_date = $1
      GROUP BY location
    `, [todayStr]);

    const countMap = {};
    bookingCounts.rows.forEach(row => {
      countMap[row.location] = parseInt(row.occupied_today);
    });

    // data
    const enrichedLots = lots.map(lot => {
      const occupiedToday = countMap[lot.location] || 0;
      const availableToday = lot.parking_spaces - occupiedToday;
      return { 
        ...lot,
        occupied_today: occupiedToday,
        available_today: availableToday
      };
    });

    res.render('reserve', {
      lots: enrichedLots,
      todayDate: todayStr
    });
  } catch (err) {
    console.error('Error loading reserve page:', err);
    res.status(500).send('Error loading parking data.');
  }
};

const postReserve = async (req, res) => {
  try {
    const { location_id, date, time, plate, duration } = req.body;
    
    const hours = parseInt(duration); 
    const email = req.session.user?.email;

    if (!email) return res.redirect('/login');

    // This only allows same-day bookings
    const inputDate = new Date(date);
    const now = new Date();
    const inputStr = inputDate.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    if (inputStr !== todayStr) {
      return res.status(400).send('Only same-day bookings are allowed.');
    }

    const userResult = await pool.query('SELECT user_id FROM "users" WHERE email = $1', [email]);
    const user_id = userResult.rows[0].user_id;

    const lotResult = await pool.query('SELECT * FROM parking_lots WHERE location_id = $1', [location_id]);
    const lot = lotResult.rows[0];

    const price = hours * parseFloat(lot.rate);
    const bookingDate = inputDate;
    const bookingTime = time;

    if (lot.occupied_spaces >= lot.parking_spaces) {
      return res.status(400).send('No parking space available at this location.');
    }

    const bookingInsert = await pool.query(
      `INSERT INTO bookings (user_id, location, time_booked_for, duration, booking_date, price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING booking_id`,
      [user_id, lot.location, bookingTime, duration, bookingDate, price]
    );

    const booking_id = bookingInsert.rows[0].booking_id;

    await pool.query(
      'UPDATE parking_lots SET occupied_spaces = occupied_spaces + 1 WHERE location_id = $1',
      [location_id]
    );

    res.redirect(`/payment/${booking_id}`);
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).send('Reservation failed.');
  }
};

module.exports = { getReservePage, postReserve };
