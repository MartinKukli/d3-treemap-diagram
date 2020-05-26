import * as d3 from "d3";

const builder = jsonData => {
  const svgWidth = 960;
  const svgHeight = 570;
  const colorsRange = ["#347B98", "#0247FE", "#4424D6"];

  const svg = d3
    .select("#tree-map")
    .attr("width", `${svgWidth}px`)
    .attr("height", `${svgHeight}px`)
    .style("fill", "grey");

  const tooltip = d3.select("#tooltip");

  const treemap = d3
    .treemap()
    .size([svgWidth, svgHeight])
    .paddingInner(1);

  const root = d3
    .hierarchy(jsonData)
    .eachBefore(
      d =>
        (d.data.id = `${d.parent ? d.parent.data.id + "." : ""}${d.data.name}`)
    )
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const categories = root
    .leaves()
    .map(nodes => nodes.data.category)
    .filter((category, index, self) => self.indexOf(category) === index);

  const colors = d3
    .scaleOrdinal()
    .domain(categories)
    .range(colorsRange);

  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

  cell
    .append("rect")
    .attr("id", d => d.data.id)
    .attr("class", "tile")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .style("fill", d => colors(d.data.category))
    .on("mousemove", d => {
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          "Name: " +
            d.data.name +
            "<br>Category: " +
            d.data.category +
            "<br>Value: " +
            d.data.value
        )
        .attr("data-value", d.data.value)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", d =>
      tooltip
        .transition()
        .duration(100)
        .style("opacity", 0)
    );

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 13 + i * 10)
    .text(d => d);
};

d3.json(
  "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
)
  .then(builder)
  .catch(() => console.error("Something is wrong..."));
