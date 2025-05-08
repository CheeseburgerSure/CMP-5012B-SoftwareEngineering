document.addEventListener("DOMContentLoaded", () => {

    // Interact with the content inside of the text box of the website
    const form = document.querySelector('form');
    const email = document.getElementById('email');
    const confirmEmail = document.getElementById('confirmEmail');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    // Event listener for submit button
    form.addEventListener("submit", function(event) {
      event.preventDefault(); // Prevent form submission
  
      // Validate email match
      if (email.value !== confirmEmail.value) {
        alert("Emails do not match");
        return;
      }
  
      // Validate password match
      if (password.value !== confirmPassword.value) {
        alert("Passwords do not match");
        return;
      }
  
      form.submit(); // Proceed with form submission
    });
  });
  