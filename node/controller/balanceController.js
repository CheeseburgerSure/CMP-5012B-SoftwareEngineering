const pool = require('../db');

const postAddBalance = async (req, res) => {
  try {
    const { email } = req.session.user;
    const amount = parseFloat(req.body.amount);

    if (!email || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid request.');
    }

    // Fetch the user's ID
    const userResult = await pool.query(
      'SELECT UserID FROM "Users" WHERE Email = $1',
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).send('User not found.');
    }

    const userId = userResult.rows[0].userid;

    // Update balance
    await pool.query(
      'UPDATE "Users" SET Balance = Balance + $1 WHERE UserID = $2',
      [amount, userId]
    );

    // Insert transaction with timestamp
    await pool.query(
      'INSERT INTO "Transactions" (UserID, Amount) VALUES ($1, $2)',
      [userId, amount]
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating balance:', err);
    res.status(500).send('Server error while updating balance.');
  }
};

module.exports = { postAddBalance };
