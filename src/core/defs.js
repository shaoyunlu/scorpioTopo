export default {
	init(vTopo){
		let el_defs = vTopo.jqSvgEl.find("defs")

		el_defs.html(`<marker id="endArrow" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="5" markerHeight="5" orient="auto">
			<path d="M 1 5 L 11 10 L 1 15 Z" style="fill: #6b9ae6; stroke-width: 1px;
			stroke-linecap: round; stroke-dasharray: 10000, 1; stroke: #6b9ae6;"></path></marker>
			<marker id="startArrow" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="6" markerHeight="6" orient="auto">
			<path d="M 22 5 L 12 10 L 22 15 Z" style="fill: #6b9ae6; stroke-width: 1px;
			stroke-linecap: round; stroke-dasharray: 10000, 1; stroke: #6b9ae6;"></path></marker>`)
	}
}