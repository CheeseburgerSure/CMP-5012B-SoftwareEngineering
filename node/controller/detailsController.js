// controller/detailsController.js
const getDetailsPage = async (req, res) => {
  try {
    const { email, first_name, last_name } = req.session.user;

    res.render('change-details', {
      email,
      firstName: first_name,
      lastName: last_name
    });
  } catch (error) {
    console.error('Error rendering details page:', error);
    res.status(500).render('change-details', { error: 'Failed to load user details.' });
  }
};

module.exports = { getDetailsPage };
