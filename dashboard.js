// Track current theme
let currentTheme = 'light-theme';

// Fetch data from Flask API
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return {};
    }
}

// Theme cycling and chart redraw
function cycleTheme() {
    const themes = ['light-theme', 'dark-theme', 'high-contrast-theme', 'pastel-theme', 'solarized-theme'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    document.body.className = themes[nextIndex];
    currentTheme = themes[nextIndex];

    // Redraw charts to update colors and restart animations
    document.querySelectorAll('.card svg').forEach(svg => svg.remove());
    drawCharts();
}

// Details panel
function showDetails(data, chartType, overviewText) {
    const container = document.getElementById("details");
    const overview = document.getElementById("overview-text");
    const tableBody = document.getElementById("data-table-content").querySelector("tbody");
    const altChart = document.getElementById("alt-chart-content");

    // Toggle open state
    if (container.classList.contains("open")) {
        container.classList.remove("open");
        return;
    }

    // Set overview text
    overview.textContent = overviewText;

    // Populate data table
    tableBody.innerHTML = "";
    data.forEach(d => {
        const row = document.createElement("tr");
        const value = typeof d.value === 'string' ? d.value : d.value.toFixed(2);
        row.innerHTML = `<td>${d.label}</td><td>${value}${d.unit ? d.unit : ''}</td>`;
        tableBody.appendChild(row);
    });

    // Draw alternate chart
    altChart.innerHTML = "";
    const svg = d3.select("#alt-chart-content").append("svg").attr("width", "100%").attr("height", 300);
    if (chartType === "line") {
        drawBarChartAlt(svg, data);
    } else if (chartType === "bar") {
        drawLineChartAlt(svg, data);
    } else if (chartType === "pie") {
        drawDonutChartAlt(svg, data);
    } else if (chartType === "area") {
        drawLineChartAlt(svg, data);
    } else if (chartType === "scatter") {
        drawBarChartAlt(svg, data);
    } else if (chartType === "radial") {
        drawGaugeChartAlt(svg, data);
    } else if (chartType === "funnel") {
        drawBarChartAlt(svg, data);
    } else if (chartType === "gauge") {
        drawRadialChartAlt(svg, data);
    }

    container.classList.add("open");
}

function closeDetails() {
    document.getElementById("details").classList.remove("open");
}

function switchTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
}

// Tooltip setup
const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// Draw all charts
async function drawCharts() {
    const data = await fetchData();

    // Placeholder data (replace with fetched data)
    const sampleData = data.sampleData || /* REPLACE_WITH_YOUR_SAMPLE_DATA */;
    const scatterData = data.scatterData || /* REPLACE_WITH_YOUR_SCATTER_DATA */;
    const funnelData = data.funnelData || /* REPLACE_WITH_YOUR_FUNNEL_DATA */;
    const radialData = data.radialData || /* REPLACE_WITH_YOUR_RADIAL_DATA */;
    const gaugeData = data.gaugeData || /* REPLACE_WITH_YOUR_GAUGE_DATA */;

    // Line Chart
    function drawLineChart() {
        const svg = d3.select("#line-chart").append("svg").attr("viewBox", "0 0 350 250");
        const width = 350, height = 250;

        const x = d3.scalePoint().domain(sampleData.map(d => d.label)).range([40, width - 40]);
        const y = d3.scaleLinear().domain([0, 100]).range([height - 40, 40]);

        svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x));
        svg.append("g").attr("transform", `translate(40, 0)`).call(d3.axisLeft(y));

        const line = d3.line().x(d => x(d.label)).y(d => y(d.value)).curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(sampleData)
            .attr("fill", "none")
            .attr("stroke", "var(--accent)")
            .attr("stroke-width", 3)
            .attr("d", line)
            .attr("stroke-dasharray", function () { return this.getTotalLength(); })
            .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
            .transition()
            .duration(1500)
            .attr("stroke-dashoffset", 0)
            .on("end", () => {
                svg.selectAll("circle")
                    .data(sampleData)
                    .enter()
                    .append("circle")
                    .attr("cx", d => x(d.label))
                    .attr("cy", d => y(d.value))
                    .attr("r", 5)
                    .attr("fill", "var(--accent)")
                    .on("mouseover", (event, d) => {
                        tooltip.transition().duration(200).style("opacity", 0.9);
                        tooltip.html(`Month: ${d.label}<br>Revenue: ${d.value}${d.unit}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));
            });

        svg.on("click", () => showDetails(sampleData, "line", "Revenue trend over the first five months, measured in thousands."));
    }
    drawLineChart();

    // Bar Chart
    function drawBarChart() {
        const svg = d3.select("#bar-chart").append("svg").attr("viewBox", "0 0 350 250");
        const width = 350, height = 250;

        const x = d3.scaleBand().domain(sampleData.map(d => d.label)).range([40, width - 40]).padding(0.2);
        const y = d3.scaleLinear().domain([0, 100]).range([height - 40, 40]);

        svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x));
        svg.append("g").attr("transform", `translate(40, 0)`).call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(sampleData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.label))
            .attr("y", d => y(0))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "var(--accent)")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Category: ${d.label}<br>Sales: ${d.value}${d.unit}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0))
            .transition()
            .duration(1200)
            .delay((d, i) => i * 150)
            .attr("y", d => y(d.value))
            .attr("height", d => height - 40 - y(d.value));

        svg.on("click", () => showDetails(sampleData, "bar", "Sales performance across different product categories, measured in thousands."));
    }
    drawBarChart();

    // Pie Chart
    function drawPieChart() {
        const svg = d3.select("#pie-chart").append("svg").attr("viewBox", "0 0 300 250");
        const radius = 100;
        const g = svg.append("g").attr("transform", `translate(150,125)`);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        g.selectAll("path")
            .data(pie(sampleData))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.label))
            .attr("opacity", 0)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Segment: ${d.data.label}<br>Share: ${d.data.value}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0))
            .transition()
            .duration(1200)
            .delay((d, i) => i * 150)
            .attr("opacity", 1);

        svg.on("click", () => showDetails(sampleData, "pie", "Market share distribution among key competitors, in percentage."));
    }
    drawPieChart();

    // Radial Chart
    function drawRadialChart() {
        const svg = d3.select("#radial-chart").append("svg").attr("viewBox", "0 0 300 250");
        const arc = d3.arc().innerRadius(80).outerRadius(100).startAngle(0);
        const value = 0.7 * Math.PI * 2;
        const g = svg.append("g").attr("transform", "translate(150,125)");

        g.append("path")
            .attr("d", arc({ endAngle: 0 }))
            .attr("fill", "var(--accent)")
            .transition()
            .duration(1500)
            .attrTween("d", () => {
                return t => arc({ endAngle: t * value });
            });

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("fill", "var(--fg)")
            .text(radialData[0].value);

        svg.on("click", () => showDetails(radialData, "radial", "Completion rate for the current project phase."));
    }
    drawRadialChart();

    // Funnel Chart
    function drawFunnelChart() {
        const svg = d3.select("#funnel-chart").append("svg").attr("viewBox", "0 0 300 250");
        funnelData.forEach((step, i) => {
            const topW = step.width, bottomW = funnelData[i + 1]?.width || 20;
            const y = i * 50;

            const path = `M${(300 - topW) / 2},${y} 
                          L${(300 + topW) / 2},${y} 
                          L${(300 + bottomW) / 2},${y + 40} 
                          L${(300 - bottomW) / 2},${y + 40} Z`;

            svg.append("path")
                .attr("d", path)
                .attr("fill", `hsl(${i * 45}, 70%, 60%)`)
                .attr("opacity", 0)
                .on("mouseover", (event) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`Stage: ${step.label}<br>Count: ${step.value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0))
                .transition()
                .duration(1200)
                .delay(i * 150)
                .attr("opacity", 1);
        });

        svg.on("click", () => showDetails(funnelData, "funnel", "Sales funnel progression from leads to closed deals."));
    }
    drawFunnelChart();

    // Area Chart
    function drawAreaChart() {
        const svg = d3.select("#area-chart").append("svg").attr("viewBox", "0 0 350 250");
        const width = 350, height = 250;

        const x = d3.scalePoint().domain(sampleData.map(d => d.label)).range([40, width - 40]);
        const y = d3.scaleLinear().domain([0, 100]).range([height - 40, 40]);

        svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x));
        svg.append("g").attr("transform", `translate(40, 0)`).call(d3.axisLeft(y));

        const area = d3.area()
            .x(d => x(d.label))
            .y0(height - 40)
            .y1(d => y(d.value))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(sampleData)
            .attr("fill", "var(--accent)")
            .attr("opacity", 0.5)
            .attr("d", area)
            .attr("stroke", "var(--accent)")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", function () { return this.getTotalLength(); })
            .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
            .transition()
            .duration(1500)
            .attr("stroke-dashoffset", 0);

        svg.selectAll("circle")
            .data(sampleData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.value))
            .attr("r", 5)
            .attr("fill", "var(--accent)")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Month: ${d.label}<br>Users: ${d.value}${d.unit}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

        svg.on("click", () => showDetails(sampleData, "area", "User growth trend over the first five months, measured in thousands."));
    }
    drawAreaChart();

    // Scatter Chart
    function drawScatterChart() {
        const svg = d3.select("#scatter-chart").append("svg").attr("viewBox", "0 0 350 250");
        const width = 350, height = 250;

        const x = d3.scaleLinear().domain([0, 100]).range([40, width - 40]);
        const y = d3.scaleLinear().domain([0, 40]).range([height - 40, 40]);

        svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x).ticks(5));
        svg.append("g").attr("transform", `translate(40, 0)`).call(d3.axisLeft(y).ticks(5));

        svg.selectAll("circle")
            .data(scatterData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.value))
            .attr("cy", d => y(d.secondary))
            .attr("r", 0)
            .attr("fill", "var(--accent)")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Product: ${d.label}<br>Primary: ${d.value}<br>Secondary: ${d.secondary}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0))
            .transition()
            .duration(1200)
            .delay((d, i) => i * 150)
            .attr("r", 8);

        svg.on("click", () => showDetails(scatterData, "scatter", "Performance metrics comparing primary and secondary KPIs."));
    }
    drawScatterChart();

    // Gauge Chart
    function drawGaugeChart() {
        const svg = d3.select("#gauge-chart").append("svg").attr("viewBox", "0 0 300 250");
        const arc = d3.arc().innerRadius(80).outerRadius(100).startAngle(-Math.PI / 2);
        const value = 0.85 * Math.PI;
        const g = svg.append("g").attr("transform", "translate(150,150)");

        g.append("path")
            .attr("d", arc({ endAngle: Math.PI / 2 }))
            .attr("fill", "var(--hover)");

        g.append("path")
            .attr("d", arc({ endAngle: -Math.PI / 2 }))
            .attr("fill", "var(--accent)")
            .transition()
            .duration(1500)
            .attrTween("d", () => {
                return t => arc({ endAngle: -Math.PI / 2 + t * value });
            });

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("fill", "var(--fg)")
            .text(gaugeData[0].value);

        svg.on("click", () => showDetails(gaugeData, "gauge", "Overall KPI achievement score."));
    }
    drawGaugeChart();
}

// Alternate charts
function drawLineChartAlt(svg, data) {
    const width = 400, height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scalePoint().domain(data.map(d => d.label)).range([40, width - 40]);
    const y = d3.scaleLinear().domain([0, Math.max(...data.map(d => d.value))]).range([height - 40, 40]);

    svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(40, 0)`).call(d3.axisLeft(y));

    const line = d3.line().x(d => x(d.label)).y(d => y(d.value)).curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "var(--accent)")
        .attr("stroke-width", 3)
        .attr("d", line);
}

function drawBarChartAlt(svg, data) {
    const width = 400, height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([40, width - 40]).padding(0.2);
    const y = d3.scaleLinear().domain([0, Math.max(...data.map(d => d.value))]).range([height - 40, 40]);

    svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(40, 0)`).call(d3.axisLeft(y));

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - 40 - y(d.value))
        .attr("fill", "var(--accent)");
}

function drawDonutChartAlt(svg, data) {
    const width = 400, height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const radius = 100;
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(50).outerRadius(radius);
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    g.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label));
}

function drawGaugeChartAlt(svg, data) {
    const width = 400, height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const arc = d3.arc().innerRadius(80).outerRadius(100).startAngle(-Math.PI / 2);
    const value = (parseFloat(data[0].value) / 100) * Math.PI;
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    g.append("path")
        .attr("d", arc({ endAngle: Math.PI / 2 }))
        .attr("fill", "var(--hover)");

    g.append("path")
        .attr("d", arc({ endAngle: -Math.PI / 2 }))
        .attr("fill", "var(--accent)")
        .transition()
        .duration(1000)
        .attrTween("d", () => {
            return t => arc({ endAngle: -Math.PI / 2 + t * value });
        });

    g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("fill", "var(--fg)")
        .text(data[0].value);
}

function drawRadialChartAlt(svg, data) {
    const width = 400, height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const arc = d3.arc().innerRadius(80).outerRadius(100).startAngle(0);
    const value = (parseFloat(data[0].value) / 100) * Math.PI * 2;
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    g.append("path")
        .attr("d", arc({ endAngle: value }))
        .attr("fill", "var(--accent)");

    g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("fill", "var(--fg)")
        .text(data[0].value);
}

// Initialize charts
drawCharts();
