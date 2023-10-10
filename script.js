document.addEventListener("DOMContentLoaded", function () {
    fetchAirtableData();
});

function fetchAirtableData() {
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
            // Extract unique cuisines and religious allowances
            const uniqueCuisines = [...new Set(data.records.map(record => record.fields.Cuisine).flat())];
            const uniqueReligiousAllowances = [...new Set(data.records.map(record => record.fields['Religious Allowance']))];

            // Populate filter options
            populateFilterOptions(uniqueCuisines, 'cuisine-filter');
            populateFilterOptions(uniqueReligiousAllowances, 'religious-filter');

            // Display restaurant data
            displayData(data.records);
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


function displayData(records) {
    const dataContainer = document.getElementById('data-container');
    let currentRow = null;
    records.forEach((record, index) => {
        // Create a new row for every third restaurant
        if (index % 3 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row';
            dataContainer.appendChild(currentRow);
        }

        const dataItem = document.createElement('div');
        dataItem.className = 'data-item';

        // Check if the Logo field is not empty
        if (record.fields.Logo[0] && record.fields.Logo[0]) {
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

        // Descriptions
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = record.fields.Description;

        // Addy
        const addressPara = document.createElement('p');
        addressPara.textContent = record.fields.Address;

        // Phone Numbers
        const phoneNumPara = document.createElement('a');
        phoneNumPara.textContent = record.fields.PhoneNumber;
        phoneNumPara.href = 'tel: ' + record.fields.PhoneNumber;

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

        // Append the dataItem to the current row
        currentRow.appendChild(dataItem);
    });
}
