class ChoroplethMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   * @param {string}
   * @param {string}
   */
  constructor(_config, _geo_data, _data, attributeElementID, tooltipElementID) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 450,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.geo_data = _geo_data;
    this.data = _data
    // this.config = _config;

    this.us = _geo_data;

    this.active = d3.select(null);
    this.attributeElementID = attributeElementID;
    this.tooltipElementID = tooltipElementID;

    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    
    // Get the selected attribute
    const attr = document.getElementById(vis.attributeElementID);
    vis.selectedLabel = attr.options[attr.selectedIndex].label;
    vis.selectedAttribute = attr.options[attr.selectedIndex].value;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth ) //height + margin.top + margin.bottom)
            .attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
            .on('click', vis.clicked);

  
    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);

    vis._categoricalColorScale =  d3.scaleOrdinal()
      .range(['#d3eecd', '#91C898', '#77B983', '#2a8d46']) // light green to dark green
      .domain(['Rural', 'Suburban','Small City', 'Urban']);
    vis._colorScale = d3.scaleLinear()
      .domain(d3.extent(vis.data, d => d[vis.selectedAttribute]))
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)


    vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                .enter().append("path")
                .attr("d", vis.path)
                // .attr("class", "county-boundary")
                .attr('fill', d => {
                      if (d.properties.pop) {
                        return vis.colorScale(d.properties.pop);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    });

    vis.counties
      .on('mousemove', (event,d) => {
        d3.select(vis.tooltipElementID)
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title">${d.properties.name}</div>
            <div><strong>${d.properties[vis.selectedAttribute]}</strong> ${vis.selectedLabel}</div>
          `);
          })
      .on('mouseleave', () => {
          d3.select(vis.tooltipElementID)
          .style('height','35px')
          .html(``);
      });



    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);
    
    d3.select('#attribute').on('change', function() {
      vis.updateVis(d3.select(this).property('value'));
    });  

    vis.updateVis()

  }


  /**
     * Update the visualization based on the selected attribute
  */
  updateVis() {
    let vis = this;
    // Get the selected attribute
    const attr = document.getElementById(vis.attributeElementID)
    vis.selectedAttribute = attr.options[attr.selectedIndex].value
    vis.selectedLabel = attr.options[attr.selectedIndex].label
    // Update color scale domain based on the selected attribute
    vis._colorScale.domain(d3.extent(vis.data, d => d[vis.selectedAttribute]));
    // Populate the map with the new data
    vis.counties.attr('fill', d => {
      const countyData = vis.data.find(item => item.cnty_fips === d.id);
      if (countyData) {
          d.properties[vis.selectedAttribute] = countyData[vis.selectedAttribute];
          if (d.properties[vis.selectedAttribute] == -1){
            return 'url(#lightstripe)';
          }
          return vis.colorScale(d.properties[vis.selectedAttribute]);
      } else {
        return 'url(#lightstripe)';
      }
  });
  }

  colorScale(num){
    const vis = this;
    // if the selected attribute is categorical, display it as such
    if(vis.selectedAttribute == 'urban_rural_status'){
      return vis._categoricalColorScale(num)
    }
    return vis._colorScale(num)
  }
}
