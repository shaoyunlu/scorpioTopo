import {setElTransform ,getElPosition} from '../utils/index'
import {findNode} from '../core/nodePool'
import {rightClickInit} from '../events/click'

function inflexPoint(opt){
	var self = this
	var vTopo = opt.vTopo

	let parentNode = findNode(opt.parentNodeId)

	this.type = "inflexPoint"

	this.range = opt.range

	this.cx = vTopo.vTopoOpt.components.inflexPoint.cx
	this.cy = vTopo.vTopoOpt.components.inflexPoint.cy
	this.r = vTopo.vTopoOpt.components.inflexPoint.r

	let node_id = opt.id || ('i_' + vTopo.uuid++)

	this.node_id = node_id

	this.snapNode = vTopo.snapSvg.paper.circle(
							this.cx,
							this.cy,
							this.r)
						.attr({
								"id" : node_id,
								"data-type" : "inflexPoint",
								"fill-opacity" : 0.9,
								"fill" : "pink",
								"transform" : "matrix(1,0,0,1,0,0)"
							  })
	this.jqNodeEl = $("#" + node_id)

	this.jqNodeEl.css("cursor" ,"pointer")

	let vTopoBaseNode_pos = getElPosition(vTopo.jqVTopoBaseNode)

	setElTransform(this.jqNodeEl ,{left:opt.pos.left - vTopoBaseNode_pos.left ,top:opt.pos.top - vTopoBaseNode_pos.top})

	this.snapNode.drag()
	parentNode.snapBaseNode.add(this.snapNode)
	var mousemove_throttle = _.throttle(function (e){
		e.stopPropagation()
		parentNode.chageInflexPoint(self)
		vTopo.setGuideLinePos(getElPosition(self.jqNodeEl))
	}, 50);

	this.jqNodeEl.bind('mousedown' ,function (e){
		e.stopPropagation()

		vTopo.jqWrapperEl.bind('mousemove.drag' ,mousemove_throttle)

		vTopo.jqWrapperEl.bind('mouseup.drag' ,function (){
			vTopo.jqWrapperEl.unbind('mousemove.drag')
			vTopo.jqWrapperEl.unbind('mouseup.drag')
			vTopo.resetGuideLinePos()
		})
	})

	this.getCenterPosition = function (){
		let offset = this.r
		var __attr = this.jqNodeEl.attr("transform")
		if (!__attr)
			return {left:(0 + offset) ,top : (0 + offset)}
		var __array = __attr.replace(")" ,"").split(",")
		return {left:(parseInt(__array[4]) + offset) ,top : (parseInt(__array[5]) + offset)}
	}

	this.remove = function (){
		let ori_array = parentNode.jqNodeEl.attr("d").split(" ")
		let res_array = ori_array.slice(0 ,(this.range+1)*3).concat(ori_array.slice((this.range+1)*3 + 3))
		parentNode.jqNodeEl.attr("d" ,res_array.join(" "))
		this.jqNodeEl.remove()
		vTopo.jqWrapperEl.unbind('mousemove.drag')
		vTopo.jqWrapperEl.unbind('mouseup.drag')
		parentNode.removeInflexPoint(this.range)
		parentNode = null
	}

	this.exception_remove = function (){
		this.jqNodeEl.remove()
		vTopo.jqWrapperEl.unbind('mousemove.drag')
		vTopo.jqWrapperEl.unbind('mouseup.drag')
		parentNode = null
	}

	rightClickInit(this ,vTopo)
}

export default inflexPoint