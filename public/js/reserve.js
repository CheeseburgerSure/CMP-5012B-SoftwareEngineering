document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const destinationInput = document.getElementById('destinationInput');
    const filterOptions = document.getElementById('filterOptions');
    const errorMessage = document.getElementById('errorMessage');
    const resultsContainer = document.getElementById('resultsContainer');
    const radiusSelect = document.getElementById('radiusSelect'); 
    const sortSelect = document.getElementById('sortSelect'); 

    
    const postcodeRegex = /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]?\s?\d[A-Za-z]{2}$/i;

    
    const sampleLocations = [
        { name: "City Centre Car Park", freeBays: 12, distance: 0.5 },
        { name: "Riverfront Parking", freeBays: 5, distance: 0.8 },
        { name: "Station Road Garage", freeBays: 3, distance: 1.2 },
        { name: "Shopping Mall Parking", freeBays: 8, distance: 1.5 },
        { name: "Green Park Spaces", freeBays: 15, distance: 1.8 },
        { name: "Outskirts Parking", freeBays: 20, distance: 2.5 }
    ];

    searchButton.addEventListener('click', function() {
        const searchValue = destinationInput.value.trim();
        
        if (searchValue === '') {
            showError('Please enter a postcode');
            hideFilters();
        } else if (!postcodeRegex.test(searchValue)) {
            showError('Invalid postcode');
            hideFilters();
        } else {
            hideError();
            showFilters();
            showResults(); 
        }
    });

    
    radiusSelect.addEventListener('change', function() {
        if (destinationInput.value.trim() !== '') {
            showResults();
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.visibility = 'visible';
    }

    function hideError() {
        errorMessage.style.visibility = 'hidden';
    }

    function showFilters() {
        filterOptions.style.display = 'flex';
    }

    function hideFilters() {
        filterOptions.style.display = 'none';
    }

    function showResults() {
        resultsContainer.innerHTML = '';
        const selectedRadius = parseInt(radiusSelect.value);
        
        
        const filteredLocations = sampleLocations.filter(
            location => location.distance <= selectedRadius
        );
        
        filteredLocations.forEach(location => {
            const locationCard = document.createElement('div');
            locationCard.className = 'location-card';
            locationCard.innerHTML = `
                <div class="location-name">${location.name}</div>
                <div class="free-bays">${location.freeBays} Free Bays</div>
                <div class="distance">${location.distance.toFixed(1)}km away</div>
            `;
            resultsContainer.appendChild(locationCard);
        });
        
        resultsContainer.style.display = 'block';
    }
});