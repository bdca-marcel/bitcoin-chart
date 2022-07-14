
function BitcoinChart() {
  let width = 720,
    height = 480,
    margins = { top: 20, right: 40, bottom: 40, left: 80 },
    xScaleBand = d3.scaleBand(),
    xScaleUtc = d3.scaleUtc(),
    yScale = d3.scaleLinear(),
    xAxis = d3.axisBottom(xScaleUtc),
    // xAxis2 = d3.axisBottom(xScaleBand),
    yAxis = d3.axisLeft(yScale),
    timeFormatter = d3.timeFormat("%d %b %H:%M"),
    xPadding = 0.2;


  function chart(selection) {
    selection.each(function (data) {
      margins.contentWidth = width - margins.left - margins.right;
      margins.contentHeight = height - margins.top - margins.bottom;

      const xAccessor = (d) => d.openTime;
      const xAccessorTime = (d) => new Date(d.openTime);

      // update scales
      xScaleBand
        .domain(data.map(xAccessor))
        .range([0, margins.contentWidth])
        .padding(xPadding);

      // interval tussen de data items
      const interval = data[1].openTime - data[0].openTime;

      // om de scaleBand en scaleTime gelijk te trekken doen we een interval * (0.5 + halve padding)  eerder en een later erbij + padding
      const minExtended = new Date(d3.min(data, xAccessor) - interval * (0.5 + xPadding / 2))
      const maxExtended = new Date(d3.max(data, xAccessor) + interval * (0.5 + xPadding / 2))

      xScaleUtc
        .domain([minExtended, maxExtended])
        .range([0, margins.contentWidth])
        .ticks(1);

      // const minY = d3.min(data.map((d) => d.min));
      const maxY = d3.max(data.map((d) => d.max));

      yScale.domain([0, maxY]).range([margins.contentHeight, 0]).nice();

      yAxis.tickFormat((t) => `$${t}`);

      const svgSelection = d3.select(this);
      const enterContainer = svgSelection
        .selectAll("#container")
        .data([data])
        .enter()
        .append("g")
        .attr("id", "container");
      enterContainer.append("g").attr("id", "xAxis");
      // enterContainer.append("g").attr("id", "xAxis2");
      enterContainer.append("g").attr("id", "yAxis");
      enterContainer.append("g").attr("id", "candles");

      const container = svgSelection
        .select("#container")
        .attr("transform", `translate(${margins.left}, ${margins.top})`);

      container
        .select("#xAxis")
        .attr("transform", `translate(0, ${margins.contentHeight})`)
        .call(xAxis);

      // Updating axis
      // xAxis2.tickFormat((t) => {
      //   const x = new Date(t);
      //   return timeFormatter(x);
      // });

      // container
      //   .select("#xAxis2")
      //   .attr("transform", `translate(0, ${margins.contentHeight - 20})`)
      //   .call(xAxis2);

      container
        .select("#yAxis")
        // .attr("transform",
        .call(yAxis);

      container.selectAll("#yAxis .tick text").style("font-size", "16px");

      container.on("mouseleave", e => {
        container.select("#tooltip-horizontal-line").remove();
        container.select("#tooltip-vertical-line").remove();
        container.select("#tooltip-x").remove();
        container.select("#tooltip-y").remove();
      })

      container.on("mousemove", (event) => {

        const [x, y] = d3.pointer(event);

        if (y > margins.contentHeight) return;

        container.selectAll('#tooltip-horizontal-line')
          .data([1])
          .join('line')
          .attr("id", "tooltip-horizontal-line")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", 4)
          .attr("x1", 0)
          .attr("x2", margins.contentWidth)
          .attr("y1", y)
          .attr("y2", y)

        const tooltipY = container.selectAll('#tooltip-y')
          .data([1])
          .join(
            enter => {
              const g = enter.append('g')
                .attr("id", "tooltip-y")

              g.append('rect')
                .attr('fill', "black")
                .attr('stroke', "black")
                .attr('stroke-width', 2)
                .attr("x", -margins.left)
                .attr("y", y - 10)
                .attr("width", margins.left)
                .attr("height", 20)

              g.append('text')
                .attr("x", -10)
                .attr("y", y)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", 'end')
                .attr("fill", "white")
                .text(`$${Math.round(yScale.invert(y))}`)
            }
            ,
            update => {
              update.select('rect')
                .attr("y", y - 10)

              update.select('text')
                .attr("y", y)
                .text(`$${Math.round(yScale.invert(y))}`)

              return update
            }
            ,
            remove => remove.remove())
      })

      const candles = container.select("#candles");
      const candleSelection = candles
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("class", "candle");

      candleSelection
        .selectAll(".candlewick") // in every candle g, select all candlewicks
        .data(d => [d]) // (re-)bind the data passed down from the candleselection as if it is an array, so we can use join
        .join("rect")
        .attr("class", "candlewick")
        .attr("x", (d) => xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2 - 1) // -1 om precies in het midden te zetten bij een oneven breedte
        .attr("y", (d) => yScale(d.max))
        .attr("width", 1)
        .attr("height", (d) => Math.abs(yScale(d.max) - yScale(d.min)));
      // .attr("height", (d) => margins.contentHeight);

      candleSelection
        .selectAll(".candlebody")
        .data(d => [d]) // (re-)bind the data passed down from the candleselection as if it is an array, so we can use join
        .join("rect")
        .attr("class", "candlebody")
        .attr("fill", (d) => (d.open > d.close ? "red" : "green"))
        .attr("x", (d) => xScaleBand(xAccessor(d)))
        .attr("y", (d) => yScale(d.open > d.close ? d.open : d.close))
        .attr("width", xScaleBand.bandwidth())
        .attr("height", (d) => Math.abs(yScale(d.open) - yScale(d.close)) > 1 ? Math.abs(yScale(d.open) - yScale(d.close)) : 1);

      candleSelection
        .selectAll(".invisible")
        .data(d => [d]) // (re-)bind the data passed down from the candleselection as if it is an array, so we can use join
        .join("rect")
        .attr("class", "invisible")
        .attr("fill", "transparent")
        .attr("x", (d) => xScaleBand(xAccessor(d)) - xPadding * xScaleBand.bandwidth() / 2)
        .attr("y", (d) => 0)
        .attr("width", margins.contentWidth / data.length)
        .attr("height", margins.contentHeight)
        .on("mouseenter", (event, d) => {
          container
            .selectAll("#tooltip-vertical-line")
            .data(d => [d])
            .join("line")
            .attr("id", "tooltip-vertical-line")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", 4)
            .attr("x1", xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2)
            .attr("x2", xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2)
            .attr("y1", (d) => 0)
            .attr("y2", (d) => margins.contentHeight)

          const tooltipX = container.selectAll('#tooltip-x')
            .data(d => [d])
            .join(
              enter => {
                const g = enter.append('g')
                  .attr("id", "tooltip-x")

                g.append('rect')
                  .attr('fill', "black")
                  .attr('stroke', "black")
                  .attr('stroke-width', 2)
                  .attr("x", Math.max(xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2 - 60, 0))
                  .attr("y", margins.contentHeight)
                  .attr("width", 120)
                  .attr("height", 20)

                g.append('text')
                  .attr("x", xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2)
                  .attr("y", margins.contentHeight + 10)
                  .attr("dominant-baseline", "middle")
                  .attr("text-anchor", 'middle')
                  .attr("fill", "white")
                  .text(`${timeFormatter(new Date(d.openTime))}`)
              }
              ,
              update => {
                update.select('rect')
                  .attr("x", Math.max(xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2 - 60, 0))

                update.select('text')
                  .attr("x", Math.max(xScaleBand(xAccessor(d)) + xScaleBand.bandwidth() / 2, 60))
                  .text(`${timeFormatter(new Date(d.openTime))}`)
                return update
              }
              ,
              remove => remove.remove())
        })
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

const width = 1080,
  height = 480;

const svgBasicShapesSelection = createSVGSVGElement(
  width,
  height,
  "bitcoin-chart"
);

const newBitCoinChart = BitcoinChart().width(width).height(height);

const loadChart = (jsonName) => {

  d3.json(`data/${jsonName}`).then(result => {
    const transformedData = transformer(result)
    svgBasicShapesSelection.datum(transformedData).call(newBitCoinChart);
  }).catch(err => console.log(err))

}

loadChart('juni-1w.json')

const onClick = (target) => {
  loadChart(`juni-${target}.json`)
}

const btns = document.querySelectorAll('.btn')

btns.forEach(btn => {
  btn.addEventListener('click', () => onClick(btn.dataset.target))
})
