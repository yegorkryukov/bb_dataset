// Getting reference to selector
var $dataSelector = document.getElementById("#selDataseto");


// initiate the dropdown button
Plotly.d3.json('/names', function(error, names){
  if (error) throw error;
  for (var i = 0; i < names.length; i++){
      d3.select("#dataselect").append("option").attr("value",`${names[i]}`).text(`${names[i]}`)
  }
});

function renderSelector(){
  
};