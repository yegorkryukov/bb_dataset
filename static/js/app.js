console.log('blblbl')

// Getting reference to selector
var $dataSelector = document.getElementById("selDataset");

// Obtain sample names and assign to dropdown
$.getJSON('/names', function(data) {
    for (var i=0; i<data.length; i++){
        option = document.createElement('option');
        option.innerHTML = data[i];
        $dataSelector.appendChild(option);
    };
});

