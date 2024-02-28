class Histogram {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     * @param {string}
     */
    constructor(_config, _data, attributeElementID) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        colorScale: _config.colorScale,
        containerWidth: _config.containerWidth || 300,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 40},
        numBins: _config.numBins || 10
      }
      this.data = _data;
      this.attributeElementID = attributeElementID
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static elements, such as axis titles
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
      

      // Get the selected attribute
      const attr = document.getElementById(vis.attributeElementID);
      vis.selectedLabel = attr.options[attr.selectedIndex].label
      vis.selectedAttribute = attr.options[attr.selectedIndex].value 

      // Initialize scales and axes
      vis.xScale = d3.scaleLinear()
        .domain(d3.extent(vis.data, d => d[vis.selectedAttribute]))
        .range([0,vis.width])
      vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

      vis.xAxis = d3.axisBottom(vis.xScale)
      .tickFormat(d3.format(".2s"));;
  
      vis.yAxis = d3.axisLeft(vis.yScale);

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
  
      // Append axis title
      vis.axisTitle = vis.svg.append('text')
          .attr('class', 'axis-title')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', '.71em')
          .text(vis.selectedLabel);

      vis.updateVis();
    }
  
    /**
     * Prepare data and scales before we render it
     */
    updateVis() {
      let vis = this;
      // update selected attribute before updating histogram
      const attr = document.getElementById(vis.attributeElementID);
      vis.selectedLabel = attr.options[attr.selectedIndex].label
      vis.selectedAttribute = attr.options[attr.selectedIndex].value  
      vis.axisTitle.text(vis.selectedLabel) 
      vis.xScale.domain(d3.extent(vis.data, d=>d[vis.selectedAttribute]))
      vis.histogram = d3.histogram()
          .value(d=>d[vis.selectedAttribute])
          .domain(vis.xScale.domain())
          .thresholds(vis.xScale.ticks(vis.config.numBins))
      vis.bins = vis.histogram(vis.data)
      vis.yScale.domain(d3.extent(vis.bins, d => d.length));   
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;

      // Join the rect with the bins data
      vis.bars = vis.chart.selectAll("rect")
          .data(vis.bins)

      vis.bars
          .join('rect')
          .merge(vis.bars)
          .transition()
          .duration(1000)
          .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")"; })
          .attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0) -1 ; })
          .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
          .style("fill", "#69b3a2")

      vis.bars
          .exit()
          .remove()
        
      // Update axes
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.transition().duration(1000).call(vis.yAxis)

    }

  }