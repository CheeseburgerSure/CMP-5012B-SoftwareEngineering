document.addEventListener('DOMContentLoaded', () => {
  // Handle Toggle for Edit Fields
  document.querySelectorAll('.btn-change').forEach(button => {
    button.addEventListener('click', () => {
      const field = button.dataset.field;
      toggleField(field);
    });
  });

  // Function to toggle edit fields visibility
  function toggleField(field) {
    const fieldId = field + '-field';
    const fieldElement = document.getElementById(fieldId);
    const allFields = document.querySelectorAll('.edit-field');
    allFields.forEach(f => f.style.display = 'none');
    fieldElement.style.display = 'block';
  }
});
