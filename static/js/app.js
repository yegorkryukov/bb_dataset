// Getting reference to selector
var $dataSelector = document.getElementById("selDataset");

// Adding event listener before populating data from json
// so the same function optionChanged renders on both page
// load and option change
$dataSelector.addEventListener("select", function() {
    optionChanged(this.value);
  });

// Obtain sample names from '/names' rounte and assign to dropdown
$.getJSON('/names', function(data) {
    // console.log(data);
    for (var i=0; i<data.length; i++){
        option = document.createElement('option');
        option.innerHTML = data[i];
        $dataSelector.appendChild(option);
    };

    // select first option when page loaded
    $dataSelector.selectedIndex = 0;

    // fire 'select' event to trigger optionChanged function
    $dataSelector.dispatchEvent(new Event('select'));
});

// function to change dataset when selector changes
function optionChanged(sample){
    $.getJSON(`/metadata/${sample}`, function(d) {
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

    // Create the pie chart
    Plotly.d3.json(`/samples/${sample}`, function(error, response) {
        if (error) return console.warn(error);
        // assign 10 values from API to lists
        // the API call return is sorted already
        var sampleValues = response[0].sample_values;
        var values = sampleValues.slice(0,10);
        var otuIDs = response[0].otu_ids;
        var labels = otuIDs.slice(0,10);
        
        Plotly.d3.json(`/otu`, function(error, otuDescriptions) {
            if (error) return console.warn(error);
            var otuHoverItems = [];
            // loop through otu values to populate appropriate descriptions
            labels.forEach(function(label){
                otuHoverItems.push(otuDescriptions[label]);
            });

            var trace1 = [{
                title: `OTU Values Frequency for sample ${sample}`,
                values: values,
                labels: otuIDs,
                hovertext: otuHoverItems,
                type: 'pie'
            }];

            var layout = {
                height: 400,
                width: 500
            };

            Plotly.newPlot('pie', trace1, layout);

            var trace2 = [{
                x: otuIDs,
                y: sampleValues,
                marker: {
                    size: sampleValues,
                    color: otuIDs,
                    hovertext: otuDescriptions
                },
                mode: 'markers'
            }];

            Plotly.newPlot('bubble', trace2, layout);
        });
    })
    

    // Plotly.d3.json(`/samples/${sample}`, function(error, response) {
    //     if (error) return console.warn(error);
    //     values = response[0].sample_values.slice(0,10);
    //     console.log(values);
    // })
}