const pool = require('../db');

const postAddBalance = async (req, res) => {
  try {

    if (!req.session.user?.email) return res.redirect('/login');

    const { email } = req.session.user;
    const amount = parseFloat(req.body.amount);

    if (!email || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid request.');
    }

    // Fetch the user's ID
    const userResult = await pool.query(
      'SELECT user_id FROM "users" WHERE email = $1',
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).send('User not found.');
    }

    const userId = userResult.rows[0].user_id;

    // Update balance
    await pool.query(
      'UPDATE "users" SET balance = balance + $1 WHERE user_id = $2',
      [amount, userId]
    );

    // Insert transaction with timestamp
    await pool.query(
      'INSERT INTO "transactions" (user_id, amount) VALUES ($1, $2)',
      [userId, amount]
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating balance:', err);
    res.status(500).send('Server error while updating balance.');
  }
};

module.exports = { postAddBalance };
