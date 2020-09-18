function textNode(opt){
	let vTopo = opt.vTopo
	let y_margin = vTopo.vTopoOpt.components.text.yMargin
	var self = this
	this.type = 'text'

	this.parentNode = opt.parentNode

	this.text = []

	opt.textArray.forEach(tmp => {
		this.text.push(tmp.text)
	})

	this.snapNode = vTopo.snapSvg.paper.text(0, 0, this.text).attr({
																	"id" : "t_" + this.parentNode.id,
																	"fill" : vTopo.vTopoOpt.components.text.textColor
																   })

	this.jqNodeEl = $("#" + 't_' + this.parentNode.id)

	this.snapNode.attr({
		"y" : this.parentNode.getNodeWidthHeight().height + y_margin
	})

	this.parentNode.snapBaseNode.add(this.snapNode)

	this.textLayout = function (){
		let p_width_height = this.parentNode.getNodeWidthHeight()
		opt.textArray.forEach( (tmp ,i) => {
			this.jqNodeEl.find("tspan").eq(i).attr("x" ,(p_width_height.width - tmp.width)/2)
			this.jqNodeEl.find("tspan").eq(i).attr("y" ,(p_width_height.height + y_margin) + y_margin*i)
		})
	}

	this.remove = function (){
		this.snapNode.remove()
		this.parentNode = null
		this.snapNode = null
		this.jqNodeEl = null
	}

	this.textLayout()
}

export default textNode