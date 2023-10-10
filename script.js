document.addEventListener("DOMContentLoaded", function () {
    // Get references to the filter select elements
    const cuisineFilter = document.getElementById('cuisine-filter');
    const religiousFilter = document.getElementById('religious-filter');
    const sortDropdown = document.getElementById('sort-order'); // Get reference to the sorting dropdown

    // Store selected options
    const selectedFilters = {
        cuisine: '',
        religious: '',
        restaurantName: '', // Added restaurantName filter
    };

    // Listen for changes in the cuisine filter
    cuisineFilter.addEventListener('change', function () {
        selectedFilters.cuisine = cuisineFilter.value;
        applyFilters(selectedFilters);
    });

    // Listen for changes in the religious filter
    religiousFilter.addEventListener('change', function () {
        selectedFilters.religious = religiousFilter.value;
        applyFilters(selectedFilters);
    });

    // Get reference to the restaurant search input
    const restaurantSearchInput = document.getElementById('restaurant-search');

    // Listen for input changes in the search bar
    restaurantSearchInput.addEventListener('input', function () {
        selectedFilters.restaurantName = restaurantSearchInput.value;
        applyFilters(selectedFilters);
    });

    // Add a default "Select" option to the sort dropdown
    sortDropdown.innerHTML = '<option value="select" selected>Select</option><option value="asc">Ascending</option><option value="desc">Descending</option>';

    // Listen for changes in the sort dropdown
    sortDropdown.addEventListener('change', function () {
        const sortOrder = sortDropdown.value;
        if (sortOrder !== 'select') {
            sortRestaurants(sortOrder);
        }
    });

    // Fetch restaurant data and apply filters
    fetchAirtableData(selectedFilters);
});

let restaurantData = []; // Store the fetched restaurant data

function fetchAirtableData() {
    const apiKey = 'patDhsVHaMssP2aVE.98b7103d478263587370cf4f3c1cc61fa091bc7245b8fde004327092be767e65'; // Replace with your Airtable API Key
    const baseId = 'appxoKr26iK85ENqi'; // Replace with your Airtable Base ID
    const table = 'Restaurant';

    const apiUrl = `https://api.airtable.com/v0/${baseId}/${table}`;

    fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            // Store the fetched data in the restaurantData array
            restaurantData = data.records;

            // Extract unique cuisines and religious allowances
            const uniqueCuisines = [...new Set(restaurantData.map(record => record.fields.Cuisine).flat())];
            const uniqueReligiousAllowances = [...new Set(restaurantData.map(record => record.fields['Religious Allowance']))];

            // Populate filter options
            populateFilterOptions(uniqueCuisines, 'cuisine-filter');
            populateFilterOptions(uniqueReligiousAllowances, 'religious-filter');

            // Display restaurant data
            displayData(restaurantData);
        })
        .catch(error => {
            console.error('Error fetching data from Airtable:', error);
        });
}

function populateFilterOptions(options, filterId) {
    const filterSelect = document.getElementById(filterId);

    // Clear existing options
    filterSelect.innerHTML = '';

    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All';
    filterSelect.appendChild(allOption);

    // Populate filter options with unique values
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        filterSelect.appendChild(optionElement);
    });
}

function applyFilters(selectedFilters) {
    // Filter the records based on user selections
    const filteredRecords = filterData(selectedFilters);

    // Display the filtered data
    displayData(filteredRecords);
}

function filterData(selectedFilters) {
    // Perform the filtering based on selected values
    return restaurantData.filter(record => {
        const cuisineMatch = selectedFilters.cuisine === '' || record.fields.Cuisine.includes(selectedFilters.cuisine);
        const religiousMatch = selectedFilters.religious === '' || record.fields['Religious Allowance'] === selectedFilters.religious;
        const restaurantNameMatch = !selectedFilters.restaurantName || record.fields.Name.toLowerCase().includes(selectedFilters.restaurantName.toLowerCase());
        return cuisineMatch && religiousMatch && restaurantNameMatch;
    });
}

function displayData(records) {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = ''; // Clear existing data

    records.forEach(record => {
        // Create a data item element
        const dataItem = document.createElement('div');
        dataItem.className = 'data-item';

        // Check if the Logo field is not empty
        if (record.fields.Logo && record.fields.Logo[0]) {
            // Create an img element for the Logo field
            const logoImg = document.createElement('img');
            logoImg.src = record.fields.Logo[0].url;
            logoImg.alt = record.fields.Name;
            logoImg.style.maxWidth = '350px';
            logoImg.style.maxHeight = '75px';

            // Append the img element to the dataItem div
            dataItem.appendChild(logoImg);
        }

        // Name
        const namePara = document.createElement('h2');
        namePara.textContent = record.fields.Name;

        // Cuisine
        const cuisinePara = document.createElement('p');
        cuisinePara.textContent = 'Cuisine: ' + record.fields.Cuisine.join(', ');

        // Description
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = record.fields.Description;

        // Address
        const addressPara = document.createElement('p');
        addressPara.textContent = record.fields.Address;

        // Phone Numbers
        const phoneNumPara = document.createElement('a');
        phoneNumPara.textContent = record.fields.PhoneNumber;
        phoneNumPara.href = 'tel:' + record.fields.PhoneNumber;

        // Create a button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Check if the Website field is not empty
        if (record.fields.Website) {
            // Website Button
            const websiteButton = document.createElement('button');
            websiteButton.textContent = 'Visit Now';
            websiteButton.className = 'visit-button';
            websiteButton.addEventListener('click', function () {
                window.location.href = record.fields.Website;
            });

            // Append the website button to the button container
            buttonContainer.appendChild(websiteButton);
        }

        // Check if the Menu field is not empty
        if (record.fields.Menu) {
            // Menu Button
            const menuButton = document.createElement('button');
            menuButton.textContent = 'View Menu';
            menuButton.className = 'menu-button';
            menuButton.addEventListener('click', function () {
                window.location.href = record.fields.Menu;
            });

            // Append the menu button to the button container
            buttonContainer.appendChild(menuButton);
        }

        // Check if the Reservations field is not empty
        if (record.fields.Reservations) {
            // Reservation Button
            const reserveButton = document.createElement('button');
            reserveButton.textContent = 'Reserve Now';
            reserveButton.className = 'reserve-button';
            reserveButton.addEventListener('click', function () {
                window.location.href = record.fields.Reservations;
            });

            // Append the reservation button to the button container
            buttonContainer.appendChild(reserveButton);
        }

        // Append all elements to the dataItem
        dataItem.appendChild(namePara);
        dataItem.appendChild(cuisinePara);
        dataItem.appendChild(descriptionPara);
        dataItem.appendChild(addressPara);
        dataItem.appendChild(phoneNumPara);
        dataItem.appendChild(buttonContainer);

        // Append the dataItem to the dataContainer
        dataContainer.appendChild(dataItem);
    });
}

// Sorting Functionality
function sortRestaurants(order) {
    restaurantData.sort((a, b) => {
        const nameA = a.fields.Name.toLowerCase();
        const nameB = b.fields.Name.toLowerCase();

        if (order === 'asc') {
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
        } else {
            if (nameA > nameB) return -1;
            if (nameA < nameB) return 1;
        }

        return 0;
    });

    // Display the sorted data
    displayData(restaurantData);
}