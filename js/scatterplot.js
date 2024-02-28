class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 300,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // get the selected options to visualize
    vis.selectedOption1 = document.getElementById('attribute').selectedOptions[0];
    vis.selectedOption2 = document.getElementById('attribute2').selectedOptions[0];

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // vis.xScale = d3.scaleLinear()
    //     .range([vis.config.margin.left, vis.width]);

    // vis.yScale = d3.scaleLinear()
    //     .range([vis.height + vis.config.margin.bottom, vis.config.margin.top]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(-vis.height - 10)
        .tickPadding(10)
        .tickFormat(d3.format(".2s"));

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSize(-vis.width - 10)
        .tickPadding(0)
        .tickFormat(d3.format(".2s"));

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    // x axis
    vis.xAxisText = vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height - 20)
        .attr('x', vis.width + 10)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(vis.selectedOption1.label);

    // y axis
    vis.yAxisText = vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text(vis.selectedOption2.label);


    // color based on urban rural status
    vis.colorScale =  d3.scaleOrdinal()
      .range(["#1b9e77","#d95f02","#7570b3","#e7298a"]) // light green to dark green
      .domain(['Rural', 'Suburban','Small City', 'Urban']);

    
    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    // get the selected options to visualize
    vis.selectedOption1 = document.getElementById('attribute').selectedOptions[0];
    vis.selectedOption2 = document.getElementById('attribute2').selectedOptions[0]; 
    
    // Specify accessor functions
    vis.xValue = d => d[vis.selectedOption1.value];
    vis.yValue = d => d[vis.selectedOption2.value];

    vis.xAxisText.text(vis.selectedOption1.label);
    vis.yAxisText.text(vis.selectedOption2.label);

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;
    // Add circles
    vis.circles = vis.chart.selectAll('.point')
        .data(vis.data)

    vis.circles
      .join('circle')
      .attr('class', 'point')
      .transition()
      .duration(1000)
      .attr('r', 4)
      .attr('cy', d => vis.yScale(vis.yValue(d)))
      .attr('cx', d => vis.xScale(vis.xValue(d)))
      .attr('fill', d=>vis.colorScale(d['urban_rural_status']))
      .attr('opacity', 0.3);

    // Tooltip event listeners
    vis.circles
        .on('mouseover', (event,d) => {
          d3.select('#scatter_tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d['display_name']}</div>
              <ul>
                <li>${vis.selectedOption1.label}: ${d[vis.selectedOption1.value]}</li>
                <li>${vis.selectedOption2.label}: ${d[vis.selectedOption2.value]}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#scatter_tooltip')
          .style('height','55px')
          .style('width','350px')
          .html(``);
        });
    vis.circles
        .exit()
        .remove()
    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())
  }
}