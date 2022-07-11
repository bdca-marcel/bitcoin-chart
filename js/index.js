function BitcoinChart() {
  let width = 720,
    height = 480,
    margins = { top: 20, right: 40, bottom: 20, left: 40 },
    xScaleBand = d3.scaleBand(),
    yScale = d3.scaleLinear(),
    xAxis = d3.axisBottom(xScaleBand),
    yAxis = d3.axisLeft(yScale),
    timeFormatter = d3.timeFormat("%d %b"),
    xPadding = 0.5;

  function chart(selection) {
    selection.each(function (data) {
      margins.contentWidth = width - margins.left - margins.right;
      margins.contentHeight = height - margins.top - margins.bottom;

      const xAccessor = (d) => d.openTime;
      // const xAccessor = (d) => new Date(d.openTime);

      // update scales
      xScaleBand
        .domain(data.map(xAccessor))
        .range([0, margins.contentWidth])
        .padding(xPadding);

      // const xScaleUtc = d3
      //   .scaleUtc()
      //   .domain(d3.extent(data, xAccessor))
      //   .range([0, margins.contentWidth]);

      // const minY = d3.min(data.map((d) => d.min));
      const maxY = d3.max(data.map((d) => d.max));

      yScale.domain([0, maxY]).range([margins.contentHeight, 0]).nice();

      // Updating axis
      xAxis.tickFormat((t) => {
        const x = new Date(t);
        return timeFormatter(x);
      });

      yAxis.tickFormat((t) => `$${t}`);

      const svgSelection = d3.select(this).data([data]);

      const container = svgSelection.selectAll("#container").data([data]);

      const enter = container.enter().append("g").attr("id", "container");

      container.attr("transform", `translate(${margins.left}, ${margins.top})`);

      enter.append("g").attr("id", "xAxis");

      container
        .select("#xAxis")
        .attr("transform", `translate(0, ${margins.contentHeight})`)
        .call(xAxis);

      enter.append("g").attr("id", "yAxis");

      container.select("#yAxis").call(yAxis);
      container.selectAll(".tick text").style("font-size", "16px");

      enter.append("g").attr("id", "candles");
      const candles = container.select("#candles");
      const candleSelection = candles
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("class", "candle");

      //   const line = container
      //     .append("g")
      //     .attr("fill", "black")
      //     .selectAll("rect")
      //     .data(data)
      //     .join("rect")
      //     .attr(
      //       "x",
      //       (d) => xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2 - 1
      //     )
      //     .attr("y", (d) => yScale(d.max))
      //     .attr("width", 3)
      //     .attr("height", (d) => Math.abs(yScale(d.max) - yScale(d.min)));

      //   const bar = container
      //     .append("g")
      //     .selectAll("rect")
      //     .data(data)
      //     .join("rect")
      //     .attr("fill", (d) => (d.open > d.close ? "red" : "green"))
      //     .attr("x", (d) => xScaleBand(xAccessor(d)))
      //     .attr("y", (d) => yScale(d.open > d.close ? d.open : d.close))
      //     .attr("width", xScaleBand.bandwidth())
      //     .attr("height", (d) => Math.abs(yScale(d.open) - yScale(d.close)));
    });
  }

  chart.width = function (value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };
  chart.height = function (value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  return chart;
}

function createSVGSVGElement(width, height, id) {
  const rootSelection = d3.select("#root");
  const svgSelection = rootSelection.append("svg");

  // using chaining syntax
  svgSelection
    .attr("id", id)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  return svgSelection;
}

const width = 800,
  height = 600;

const svgBasicShapesSelection = createSVGSVGElement(
  width,
  height,
  "bitcoin-chart"
);

const dummyData = [
  {
    openTime: 1657238400000,
    open: 5,
    close: 10,
    min: 3,
    max: 15,
    volume: 123,
  },
  {
    openTime: 1657324800000,
    open: 10,
    close: 14,
    min: 8,
    max: 24,
    volume: 223,
  },
  {
    openTime: 1657411200000,
    open: 14,
    close: 8,
    min: 4,
    max: 16,
    volume: 113,
  },
  {
    openTime: 1657497600000,
    open: 8,
    close: 24,
    min: 3,
    max: 34,
    volume: 323,
  },
  {
    openTime: 1657637600000,
    open: 24,
    close: 28,
    min: 14,
    max: 30,
    volume: 222,
  },
];

const newBitCoinChart = BitcoinChart().width(width).height(height);

svgBasicShapesSelection.datum(dummyData).call(newBitCoinChart);

dummyData.push({
  openTime: 1657767600000,
  open: 28,
  close: 22,
  min: 14,
  max: 31,
  volume: 111,
});

// svgBasicShapesSelection.datum(dummyData).call(newBitCoinChart);
