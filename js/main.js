Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0];
  const countyHealthData = data[1];

  // d3 was reading in csv data as strings, so we convert them back to numbers here
  countyHealthData.forEach(function(d) {
        d.poverty_perc = +d.poverty_perc;
        d.median_household_income = +d.median_household_income;
        d.education_less_than_high_school_percent = +d.education_less_than_high_school_percent;
        d.air_quality = +d.air_quality;
        d.park_access = +d.park_access;
        d.percent_inactive = +d.percent_inactive;
        d.percent_smoking = +d.percent_smoking;
        d.elderly_percentage = +d.elderly_percentage;
        d.number_of_hospitals = +d.number_of_hospitals;
        d.number_of_primary_care_physicians = +d.number_of_primary_care_physicians;
        d.percent_no_heath_insurance = +d.percent_no_heath_insurance;
        d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
        d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;
        d.percent_stroke = +d.percent_stroke;
        d.percent_high_cholesterol = +d.percent_high_cholesterol;
    });

  // Populate the map with the default data (poverty_perc)
  geoData.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < countyHealthData.length; i++) {
      if (d.id === countyHealthData[i].cnty_fips) {
        d.properties.pop = +countyHealthData[i].poverty_perc;
      }

    }
  });

  const choroplethMap1 = new ChoroplethMap({ 
    parentElement: '.map1',   
  }, geoData, countyHealthData, "attribute", "#tooltip1");

  const choroplethMap2 = new ChoroplethMap({ 
    parentElement: '.map2',   
  }, geoData, countyHealthData, "attribute2", "#tooltip2");

  
  // create scatterplot
  const scatterplot = new Scatterplot({ 
    parentElement: '#scatterplot',   
  }, countyHealthData);

  // create histograms
  const histogram1 = new Histogram({ 
    parentElement: '#hist1svg',
  }, countyHealthData,
    'attribute'
  );

  const histogram2 = new Histogram({ 
    parentElement: '#hist2svg',
  }, countyHealthData,
  'attribute2'
  );

  // connect selection changes to the correct update visualization updates
  d3.select(`#attribute`).on('change', function() {
    histogram1.updateVis();
    choroplethMap1.updateVis();
    scatterplot.updateVis();
  });    
  d3.select(`#attribute2`).on('change', function() {
    histogram2.updateVis();
    choroplethMap2.updateVis();
    scatterplot.updateVis();
  });  

  // update every visualization once to ensure they have the right data displayed
  histogram1.updateVis();
  histogram2.updateVis();
  choroplethMap1.updateVis();
  choroplethMap2.updateVis();
  scatterplot.updateVis();
})
.catch(error => console.error(error));

