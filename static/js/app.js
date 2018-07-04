console.log('blblbl')

// Getting reference to selector
var $dataSelector = document.getElementById("selDataset");

// Obtain sample names from '/names' rounte and assign to dropdown
$.getJSON('/names', function(data) {
    console.log(data);
    for (var i=0; i<data.length; i++){
        option = document.createElement('option');
        option.innerHTML = data[i];
        $dataSelector.appendChild(option);
    };
});

$dataSelector.addEventListener("select", function() {
    optionChanged(this.value);
  });

// // Assign the default sample route once the page loads
// $.getJSON("/metadata/BB_940", function(d) {
//     var data = d;
//     console.log(data);
// });



// function to change dataset when selector changes
function optionChanged(sample){
    var path = `/metadata/${sample}`;
    $.getJSON(path, function(d) {
        // get the ul element
        var $sample = document.getElementById("sample");

        // reset ul 
        $sample.innerHTML = '';

        // loop through JSON object and append LI elements to list
        $.each(d, function(i, val){
            li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `${i}: ${val}`
            $sample.appendChild(li);
        });
    });
    
    // Plotly.d3.json(path, function(error, response) {
    //     if (error) return console.warn(error);
    //     var data = response;
    //     console.log(data);
    //     var layout = {
    //         height: 400,
    //         width: 500
    //       };
    //     console.log(data);
    //     Plotly.plot("pie", data, layout)
    // })
}