import BaseNode from './base'
import {removeNode ,findNode} from '../core/nodePool'
import InflexPoint from './inflexPoint'
import {lineIsInNode ,getElPosition ,getSpaceIndexFromLine ,
		getLinePathWithOutStart,getLinePathWithoutEnd,getEventOffSetX ,getEventOffSetY} from '../utils/index'
import {rightClickInit} from '../events/click'

/** */

function LineNode(vTopo ,opt){
	var self = this
	this.type = 'line'

	this.startNode = opt.startNode
	this.endNode

	this.inflexPointArray = []
	this.inflexPointIndex = []

	this.pos = {
		startX : 0,
		startY : 0,
		endX : 0,
		endY : 0
	}
	this.snapBaseNodeCreate(vTopo ,opt)

	let start_node_pos = this.startNode.getCenterPosition()

	this.snapNode = vTopo.snapSvg.paper
					.path("M 0 0 L 0 0")
					.attr({
					    "stroke": vTopo.vTopoOpt.components.line.strokeColor,
					    "strokeWidth": vTopo.vTopoOpt.components.line.lineWidth,
					    "fill" : "none",
					    "id" : "l_" + this.id,
					    "data-type" : "line",
					    "transform" : "matrix(1,0,0,1,"+start_node_pos.left+","+start_node_pos.top+")"
					})

	this.snapBaseNode.add(this.snapNode)
	this.snapBaseNode.attr('id' ,'g_' + this.id)
	this.jqBaseNodeEl = $("#" + 'g_' + this.id)
	this.jqNodeEl = $("#" + 'l_' + this.id)

	this.snapBaseNode.insertAfter(vTopo.pathStartEl)

	//this.jqNodeEl.css("marker-start" ,"url('#startArrow')")
	this.jqNodeEl.css("marker-end" ,"url('#endArrow')")

	var throttled

	this.__lineMousemoveEventInit = function (){
		let array_d = self.jqNodeEl.attr("d").split(" ")
		let array_transform = self.jqNodeEl.attr("transform").replace(")" ,"").split(",")
		let svg_g_pos = getElPosition(vTopo.jqVTopoBaseNode)
		throttled = _.throttle(function (e){
			self.jqNodeEl.attr("d" ,"M 0 0 L " + (0-svg_g_pos.left + getEventOffSetX(e ,vTopo) + parseInt(array_d[4]) - parseInt(array_transform[4])) 
									+ " " + (0-svg_g_pos.top + getEventOffSetY(e ,vTopo) + parseInt(array_d[5]) - parseInt(array_transform[5])))
		}, 50);
		vTopo.jqWrapperEl.bind('mousemove' ,throttled)

		setTimeout(()=>{
			vTopo.jqWrapperEl.bind('click.drag' ,function (e){
				e.stopPropagation()
				vTopo.jqWrapperEl.unbind('mousemove')
				vTopo.jqWrapperEl.unbind('click.drag')
				var endNode
				if (!(endNode = lineIsInNode(self.jqNodeEl ,vTopo))){
					self.remove()
				}
				else
				{
					self.endNode = endNode
					self.startNode.relationLinkNodeIdArray.push(self.id)
					self.endNode.relationLinkNodeIdArray.push(self.id)
					self.sideToSideLink()
					self.__lineMouseoverEventInit()
					// 连线之后，进行右键菜单初始化
					rightClickInit(self ,vTopo)
				}
			})
		} ,200)
	}

	this.__lineMouseoverEventInit = function (){
		if (vTopo.mode == "view")
			return false
		this.snapNode.mouseover(function (){
			self.snapNode.attr("strokeWidth" ,10)
			self.jqNodeEl.css("cursor" ,"pointer")
			self.snapNode.click(e =>{
				let __inflexNode = 	new InflexPoint({
														vTopo : vTopo,
														parentNodeId : self.id,
														pos : {left:getEventOffSetX(e ,vTopo) ,top:getEventOffSetY(e ,vTopo)}
													})
				self.inflexPointArray.push(__inflexNode)
				let __range = self.insertInflexPoint(__inflexNode)
				__inflexNode.range = __range
				if (__range < 0){
					__inflexNode.exception_remove()
					self.inflexPointArray = _.filter(self.inflexPointArray ,tmp =>{
						return tmp.range != -1
					})
				}
			})
		}).mouseout(function (){
			self.snapNode.attr("strokeWidth" ,vTopo.vTopoOpt.components.line.lineWidth)
			self.jqNodeEl.css("cursor" ,"default")
			self.snapNode.unclick()
		})
	}

	this.sideToSideLink = function (){
		// 找到range最大的折点
		let __startNode
		if (this.inflexPointIndex.length == 0)
			__startNode = self.startNode
		else
			__startNode = _.find(this.inflexPointArray ,tmp=>{return tmp.range == _.max(this.inflexPointIndex)})
		self.updateEndNodePosition(self.endNode.getCenterPosition(),
								self.adjustNodePosition(__startNode ,self.endNode))
		// 找到range为0的折点
		let __endNode
		if (this.inflexPointIndex.length == 0)
			__endNode = self.endNode
		else
			__endNode = _.find(this.inflexPointArray ,tmp=>{return tmp.range == 0})
		self.updateStartNodePosition(self.startNode,
									self.adjustNodePosition(__endNode ,self.startNode))
	}

	this.adjustNodePosition = function (condition_node ,answer_node){
		let offset_obj = {left:0,top:0}
		let condition_node_pos = condition_node.getCenterPosition()
		let answer_node_pos = answer_node.getCenterPosition()

		// 两条横边长度
		let x_side = Math.abs(answer_node_pos.left - condition_node_pos.left)
		let y_side = Math.abs(answer_node_pos.top - condition_node_pos.top)
		// 斜边长度
		let hypo_side = Math.sqrt(x_side*x_side+y_side*y_side)

		// 计算偏移量
		let x_offset = Math.round((answer_node.r/hypo_side)*x_side)
		let y_offset = Math.round((answer_node.r/hypo_side)*y_side)

		answer_node_pos.left > condition_node_pos.left ? (offset_obj.left = offset_obj.left - x_offset)
													   : (offset_obj.left = offset_obj.left + x_offset)
		answer_node_pos.top > condition_node_pos.top ? (offset_obj.top = offset_obj.top - y_offset)
													   : (offset_obj.top = offset_obj.top + y_offset)
		return offset_obj
	}

	this.updateStartNodePosition = function (startNode ,offset_obj){
		let array_d = self.jqNodeEl.attr("d").split(" ")
		let array_d_length = array_d.length
		var array_transform = this.jqNodeEl.attr("transform").replace(")" ,"").split(",")
		var node_transform = startNode.jqBaseNodeEl.attr("transform").replace(")" ,"").split(",")
		let __x = parseInt(node_transform[4]) + startNode.r - parseInt(array_transform[4])
		let __y = parseInt(node_transform[5]) + startNode.r - parseInt(array_transform[5])
		this.jqNodeEl.attr("d" ,"M " + (__x + offset_obj.left) + " " + (__y + offset_obj.top) + " "
									 + getLinePathWithOutStart(this.jqNodeEl)
						  )
	}

	this.updateEndNodePosition = function (end_node_pos ,offset_obj){
		var array_transform = this.jqNodeEl.attr("transform").replace(")" ,"").split(",")
		this.jqNodeEl.attr("d" ,getLinePathWithoutEnd(this.jqNodeEl) + " L " + 
											(end_node_pos.left + offset_obj.left - parseInt(array_transform[4]))
									+ " " + (end_node_pos.top + offset_obj.top - parseInt(array_transform[5]))
						  )
	}

	// 节点删除
	this.remove = function (){
		if (this.inflexPointArray)
			this.inflexPointArray.forEach(tmp =>{
				tmp.remove()
			})
		// startNode 与 endNode的  link属性需要更新
		this.startNode && this.startNode.updataRelationLinkNode(this.id)
		this.endNode && this.endNode.updataRelationLinkNode(this.id)
		removeNode(this.id)
		this.jqBaseNodeEl.remove()
		vTopo.jqWrapperEl.unbind('mousemove')
		vTopo.jqWrapperEl.unbind('click.drag')

		this.startNode = null
		this.endNode = null
		this.inflexPointArray = null
		this.inflexPointIndex = null

		this.baseRemove()
	}

	// 添加折点
	this.insertInflexPoint = function (__inflexNode){
		let x
		let y
		var __str
		var __path = this.snapNode.attr("d").split(" ")
		
		let __inflexNode_pos =  getElPosition(__inflexNode.jqNodeEl)
		let __jqNodeEl_pos =  getElPosition(this.jqNodeEl)
		x = __inflexNode_pos.left - __jqNodeEl_pos.left
		y = __inflexNode_pos.top - __jqNodeEl_pos.top

		__str = "M " +  __path[1] + " " + __path[2]
		var __range
		if(__inflexNode.range || __inflexNode.range == 0)
			__range = __inflexNode.range
		else
			__range = getSpaceIndexFromLine( x ,y , this)
		let mid_num = __path.length/3 - 1
		for (var i = 0; i < mid_num; i++) {
			if (i == __range)
				__str = __str + " L " + x + " " + y
			let _t = (i+1)*3
			__str = __str + " L " + __path[_t+1] + " " + __path[_t+2]
		}
		this.snapNode.attr("d" ,__str)
		this.updateInflexIndex()
		return __range
	}

	// 移动折点
	this.chageInflexPoint = function (__inflexNode){
		let x
		let y
		var __str
		var __path = this.snapNode.attr("d").split(" ")
		
		let __inflexNode_pos =  getElPosition(__inflexNode.jqNodeEl)
		let __jqNodeEl_pos =  getElPosition(this.jqNodeEl)

		x = __inflexNode_pos.left - __jqNodeEl_pos.left
		y = __inflexNode_pos.top - __jqNodeEl_pos.top

		__str = "M " +  __path[1] + " " + __path[2]
		let mid_num = __path.length/3 - 1
		for (var i = 0; i < mid_num; i++) {
			if (i == __inflexNode.range)
				__str = __str + " L " + (x) + " " + (y)
			else
			__str = __str + " L " + __path[(i+1)*3+1] + " " + __path[(i+1)*3+2]
		}
		this.snapNode.attr("d" ,__str)
		this.sideToSideLink()
	}

	// 删除折点
	this.removeInflexPoint = function (__range){
		this.inflexPointArray = _.filter(this.inflexPointArray ,tmp =>{
			return tmp.range != __range
		})
		this.updateInflexIndex()
		this.sideToSideLink()
	}

	// 更新折点索引
	this.updateInflexIndex = function (){
		this.inflexPointIndex = []
		let array_d = this.jqNodeEl.attr("d").split(" ")
		let refer_pos = getElPosition(this.jqNodeEl)
		let __x
		let __y
		let flag = false
		let res_pos
		this.inflexPointArray.forEach(inflexPoint => {
			flag = false
			let inflexPoint_pos = getElPosition(inflexPoint.jqNodeEl)
			__x = inflexPoint_pos.left - refer_pos.left
			__y = inflexPoint_pos.top - refer_pos.top
			for (var i = 0; i < array_d.length; i++) {
				if (!flag){
					if (array_d[i] == __x && array_d[i+1] == __y){
						flag = true
						res_pos = i
					}
				}
			}
			inflexPoint.range = Math.round(res_pos/3) - 1
			this.inflexPointIndex.push(inflexPoint.range)
		})
	}

	this.loadData = function (){
		if (opt.endNodeId)
		{
			self.endNode = findNode(opt.endNodeId)
			self.startNode.relationLinkNodeIdArray.push(self.id)
			self.endNode.relationLinkNodeIdArray.push(self.id)
			self.__lineMouseoverEventInit()
			// 连线之后，进行右键菜单初始化
			rightClickInit(self ,vTopo)

			opt.inflexPointArray.forEach(tmp => {
				let __inflexNode = 	new InflexPoint({
														id : tmp.id,
														range : tmp.range,
														vTopo : vTopo,
														parentNodeId : self.id,
														pos : {left:tmp.pos.left ,top:tmp.pos.top}
													})
				self.inflexPointArray.push(__inflexNode)
				let __range = self.insertInflexPoint(__inflexNode)
				__inflexNode.range = __range
			})
			self.sideToSideLink()
		}
		else
		{
			self.__lineMousemoveEventInit()
		}
	}

	this.saveData = function (){
		let saveData = {}
		saveData.type = "line"
		saveData.id = this.id
		saveData.startNodeId = this.startNode.id
		saveData.endNodeId = this.endNode.id
		saveData.inflexPointArray = []
		let __array = _.sortBy(this.inflexPointIndex, function(num){ return Math.min(num); });
		__array.forEach(__id => {
			let tmp = _.find(self.inflexPointArray ,__tmp =>{return __tmp.range == __id})
			let __obj = new Object()
			__obj.pos = getElPosition(tmp.jqNodeEl)
			__obj.id = tmp.node_id
			__obj.range = tmp.range
			saveData.inflexPointArray.push(__obj)
		})
		return saveData
	}

	this.loadData()
}

LineNode.prototype = new BaseNode()

export default LineNode