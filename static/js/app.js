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

    // Create the charts
    Plotly.d3.json(`/samples/${sample}`, function(error, response) {
        if (error) return console.warn(error);

        //assign whole lists from API response to variables
        var sampleValues = response[0].sample_values;
        var otuIDs = response[0].otu_ids;

        // assign 10 values from API
        // the API call return is sorted already
        var values = sampleValues.slice(0,10);
        var labels = otuIDs.slice(0,10);
        
        Plotly.d3.json(`/otu`, function(error, otuDescriptions) {
            if (error) return console.warn(error);


            var otuHoverItems = [];
            // loop through otu values to populate appropriate descriptions
            labels.forEach(function(label){
                otuHoverItems.push(otuDescriptions[label]);
            });

            var tracePie = [{
                title: `OTU Values Frequency for sample ${sample}`,
                values: values,
                labels: otuIDs,
                hovertext: otuHoverItems,
                type: 'pie'
            }];

            var layoutPie = {
                title: 'Top 10 samples',
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 40,
                    pad: 4
                  },
                hovermode: 'closest',
                showlegend: true
            };

            var traceBubble = [{
                x: otuIDs,
                y: sampleValues,
                text: otuDescriptions,
                mode: 'markers',
                marker: {
                    size: sampleValues,
                    color: otuIDs
                }
            }];

            var layoutBubble = {
                title: 'Sample Value vs the OTU ID',
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 40,
                    pad: 4
                  },
                hovermode: 'closest',
                showlegend: false
            };

            var pieElem = Plotly.d3.select('#pie')
                .style({
                    width: '99%',
                    'margin-left': '1%',

                    height: '50vh',
                    'margin-top': '1vh'
                });
            
            var pie = pieElem.node();
            
            var bubbleElem = Plotly.d3.select('#bubble')
                .style({
                    width: '99%',
                    'margin-left': '1%',

                    height: '50vh',
                    'margin-top': '1vh'
                });
            
            var bubble = bubbleElem.node();

            Plotly.newPlot(pie, tracePie, layoutPie);
            Plotly.newPlot(bubble, traceBubble, layoutBubble);
            
            window.onresize = function() {
                Plotly.Plots.resize(bubbleDiv);
                Plotly.Plots.resize(pieDiv);
            };
        });
    })
};

