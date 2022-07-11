

function BitcoinChart() {
  
}








function createSVGSVGElement(width, height, id) {
  const rootSelection = d3.select('#root');
  const svgSelection = rootSelection.append('svg');

  // using chaining syntax
  svgSelection.attr('id', id)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  return svgSelection;
}

const width = 800, height = 600;
const svgBasicShapesSelection = createSVGSVGElement(width, height, 'bitcoin-chart');






