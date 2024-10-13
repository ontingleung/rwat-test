function processStudentData(student) {
    const [firstName, lastName] = student.name.split(' ');
    return {
        firstName,
        lastName,
        id: student.id
    };
}

function displayData(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; 

    data.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${student.firstName}</td><td>${student.lastName}</td><td>${student.id}</td>`;
        tableBody.appendChild(row);
    });
}

//synchronous XMLHttpRequest
function fetchSynchronously() {
    const request = new XMLHttpRequest();
    let allData = [];

    request.open('GET', 'data/reference.json', false); 
    request.send();
    if (request.status === 200) {
        const reference = JSON.parse(request.responseText);
        let nextFile = reference.data_location;

        while (nextFile) {
            request.open('GET', `data/${nextFile}`, false);
            request.send();
            if (request.status === 200) {
                const response = JSON.parse(request.responseText);
                const processedData = response.data.map(processStudentData);
                allData = allData.concat(processedData);
                nextFile = response.data_location;
            } else {
                console.error("Error loading data");
                break;
            }
        }
        displayData(allData);
    }
}

//asynchronous XMLHttpRequest with callbacks
function fetchAsynchronously() {
    const request = new XMLHttpRequest();
    let allData = [];

    function fetchData(file) {
        request.open('GET', `data/${file}`, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                const response = JSON.parse(request.responseText);
                const processedData = response.data.map(processStudentData);
                allData = allData.concat(processedData);

                if (response.data_location) {
                    fetchData(response.data_location);
                } else {
                    displayData(allData);
                }
            }
        };
        request.send();
    }

    request.open('GET', 'data/reference.json', true);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            const reference = JSON.parse(request.responseText);
            fetchData(reference.data_location);
        }
    };
    request.send();
}

//fetch API and promises
function fetchWithPromises() {
    let allData = [];

    function fetchData(file) {
        return fetch(`data/${file}`)
            .then(response => response.json())
            .then(response => {
                const processedData = response.data.map(processStudentData);
                allData = allData.concat(processedData);

                if (response.data_location) {
                    return fetchData(response.data_location);
                } else {
                    return allData;
                }
            });
    }

    fetch('data/reference.json')
        .then(response => response.json())
        .then(reference => fetchData(reference.data_location))
        .then(allData => displayData(allData))
        .catch(error => console.error('Error:', error));
}

document.getElementById('syncButton').addEventListener('click', fetchSynchronously);
document.getElementById('asyncButton').addEventListener('click', fetchAsynchronously);
document.getElementById('fetchButton').addEventListener('click', fetchWithPromises);
