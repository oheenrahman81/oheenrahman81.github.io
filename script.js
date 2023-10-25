document.addEventListener("DOMContentLoaded", function () {
    // Get references to the filter select elements
    const cuisineFilter = document.getElementById('cuisine-filter');
    const religiousFilter = document.getElementById('religious-filter');
    const sortDropdown = document.getElementById('sort-order');
    const restaurantSearchInput = document.getElementById('restaurant-search');

    // Store selected options
    const selectedFilters = {
        cuisine: '',
        religious: '',
        restaurantName: '',
    };
    
    // Add variables for pagination
    const itemsPerPage = 15;
    let currentPage = 1;

    let restaurantData = []; // Store the fetched restaurant data

    // Fetch restaurant data and apply filters
    fetchAirtableData(selectedFilters, itemsPerPage);

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
    fetchAirtableData(selectedFilters, itemsPerPage);
    
    function fetchAirtableData(selectedFilters, itemsPerPage) {
        const apiKey = 'patDhsVHaMssP2aVE.98b7103d478263587370cf4f3c1cc61fa091bc7245b8fde004327092be767e65';
        const baseId = 'appxoKr26iK85ENqi';
        const table = 'Restaurant';

        const apiUrl = `https://api.airtable.com/v0/${baseId}/${table}`;

        fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            restaurantData = data.records;

            const uniqueCuisines = [...new Set(restaurantData.map(record => record.fields.Cuisine).flat())];
            const uniqueReligiousAllowances = [...new Set(restaurantData.map(record => record.fields['Religious Allowance']))];

            populateFilterOptions(uniqueCuisines, 'cuisine-filter');
            populateFilterOptions(uniqueReligiousAllowances, 'religious-filter');

            displayData(restaurantData, currentPage, itemsPerPage);
        })
        .catch(error => {
            console.error('Error fetching data from Airtable:', error);
        });
    }

    function populateFilterOptions(options, filterId) {
        const filterSelect = document.getElementById(filterId);

        filterSelect.innerHTML = '';

        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All';
        filterSelect.appendChild(allOption);

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            filterSelect.appendChild(optionElement);
        });
    }

    function applyFilters(selectedFilters) {
        const filteredRecords = filterData(selectedFilters);
        displayData(filteredRecords, currentPage, itemsPerPage);
    }

    function filterData(selectedFilters) {
        return restaurantData.filter(record => {
            const cuisineMatch = selectedFilters.cuisine === '' || record.fields.Cuisine.includes(selectedFilters.cuisine);
            const religiousMatch = selectedFilters.religious === '' || record.fields['Religious Allowance'] === selectedFilters.religious;
            const restaurantNameMatch = !selectedFilters.restaurantName || record.fields.Name.toLowerCase().includes(selectedFilters.restaurantName.toLowerCase());
            return cuisineMatch && religiousMatch && restaurantNameMatch;
        });
    }

    function displayData(records, page, itemsPerPage) {
        const dataContainer = document.getElementById('data-container');
        dataContainer.innerHTML = '';

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageRecords = records.slice(start, end);

        pageRecords.forEach(record => {
            const dataItem = document.createElement('div');
            dataItem.className = 'data-item';

            if (record.fields.Logo && record.fields.Logo[0]) {
                const logoImg = document.createElement('img');
                logoImg.src = record.fields.Logo[0].url;
                logoImg.alt = record.fields.Name;
                logoImg.style.maxWidth = '350px';
                logoImg.style.maxHeight = '75px';
                dataItem.appendChild(logoImg);
            }

            const namePara = document.createElement('h2');
            namePara.textContent = record.fields.Name;

            const cuisinePara = document.createElement('p');
            cuisinePara.textContent = 'Cuisine: ' + record.fields.Cuisine.join(', ');

            const descriptionPara = document.createElement('p');
            descriptionPara.textContent = record.fields.Description;

            const addressPara = document.createElement('p');
            addressPara.textContent = record.fields.Address;

            const phoneNumPara = document.createElement('a');
            phoneNumPara.textContent = record.fields.PhoneNumber;
            phoneNumPara.href = 'tel:' + record.fields.PhoneNumber;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            if (record.fields.Website) {
                const websiteButton = document.createElement('button');
                websiteButton.textContent = 'Visit Now';
                websiteButton.className = 'visit-button';
                websiteButton.addEventListener('click', function () {
                    window.location.href = record.fields.Website;
                });

                buttonContainer.appendChild(websiteButton);
            }

            if (record.fields.Menu) {
                const menuButton = document.createElement('button');
                menuButton.textContent = 'View Menu';
                menuButton.className = 'menu-button';
                menuButton.addEventListener('click', function () {
                    window.location.href = record.fields.Menu;
                });

                buttonContainer.appendChild(menuButton);
            }

            if (record.fields.Reservations) {
                const reserveButton = document.createElement('button');
                reserveButton.textContent = 'Reserve Now';
                reserveButton.className = 'reserve-button';
                reserveButton.addEventListener('click', function () {
                    window.location.href = record.fields.Reservations;
                });

                buttonContainer.appendChild(reserveButton);
            }

            dataItem.appendChild(namePara);
            dataItem.appendChild(cuisinePara);
            dataItem.appendChild(descriptionPara);
            dataItem.appendChild(addressPara);
            dataItem.appendChild(phoneNumPara);
            dataItem.appendChild(buttonContainer);

            dataContainer.appendChild(dataItem);
        });

        createPagination(page, Math.ceil(records.length / itemsPerPage));
    }

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

        displayData(restaurantData, currentPage, itemsPerPage);
    }

    function createPagination(currentPage, totalPages) {
        const paginationContainer = document.getElementById('pagination');

        if (paginationContainer) {
            paginationContainer.innerHTML = '';

            const previousButton = document.createElement('button');
            previousButton.textContent = 'Previous';
            previousButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayData(restaurantData, currentPage, itemsPerPage);
                }
            });

            paginationContainer.appendChild(previousButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    displayData(restaurantData, currentPage, itemsPerPage);
                });

                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayData(restaurantData, currentPage, itemsPerPage);
                }
            });

            paginationContainer.appendChild(nextButton);
        }
    }
    function createPagination(currentPage, totalPages) {
        const paginationContainer = document.getElementById('pagination2');

        if (paginationContainer) {
            paginationContainer.innerHTML = '';

            const previousButton = document.createElement('button');
            previousButton.textContent = 'Previous';
            previousButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayData(restaurantData, currentPage, itemsPerPage);
                }
            });

            paginationContainer.appendChild(previousButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    displayData(restaurantData, currentPage, itemsPerPage);
                });

                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayData(restaurantData, currentPage, itemsPerPage);
                }
            });

            paginationContainer.appendChild(nextButton);
        }
    }
});