document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('create-account-form');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the form from submitting the traditional way (refreshing the page)
  
      const formData = new FormData(form);
  
      fetch('/createAccountForm', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        if (data.message) {
          alert(data.message); // Alert the user with the response message
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error with your request.');
      });
    });
  });
  