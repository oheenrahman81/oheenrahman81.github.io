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
        displayData(data.records);
    })
    .catch(error => {
        console.error('Error fetching data from Airtable:', error);
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

        // Create an img element for the Logo field
        const logoImg = document.createElement('img');
        logoImg.src = record.fields.Logo[0].url;
        logoImg.alt = record.fields.Name;
        logoImg.style.maxWidth = '350px';
        logoImg.style.maxHeight = '75px';

        // Append the img element to the dataItem div
        dataItem.appendChild(logoImg);

        // Name
        const namePara = document.createElement('h2');
        namePara.textContent = record.fields.Name;

        // Cuisin
        const cuisinePara = document.createElement('p');
        cuisinePara.textContent = 'Cuisine: ' + record.fields.Cuisine.join(', ');
        
        // Descriptions
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = record.fields.Description;
        
        // Addy
        const addressPara = document.createElement('p');
        addressPara.textContent = record.fields.Address;

        // Website Button
        const websiteButton = document.createElement('button');
        websiteButton.textContent = 'Visit Now!';
        websiteButton.className = 'visit-button';
        websiteButton.addEventListener('click', function () {
            window.location.href = record.fields.Website; // Redirect to the website URL
        });
        
        // Menu
        const lineMenuWebsiteButton = document.createElement('p');
        const menuButton = document.createElement('button');
        menuButton.textContent = 'View Menu';
        menuButton.className = 'menu-button';
        menuButton.addEventListener('click', function () {
            window.location.href = record.fields.Menu;
        });

        // Phone Numbers
        const phoneNumPara = document.createElement('p');
        phoneNumPara.textContent = record.fields.PhoneNumber;

        dataItem.appendChild(namePara);
        dataItem.appendChild(cuisinePara);
        dataItem.appendChild(descriptionPara);
        dataItem.appendChild(addressPara);
        dataItem.appendChild(websiteButton);
        dataItem.appendChild(lineMenuWebsiteButton);
        dataItem.appendChild(menuButton);
        dataItem.appendChild(phoneNumPara);


        // Append the dataItem to the current row
        currentRow.appendChild(dataItem);
    });
}
