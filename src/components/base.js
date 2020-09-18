import {registerNode} from '../core/nodePool'

function BaseNode(vTopo ,opt){
	opt = opt || {}

	/** 节点唯一标识 */
	this.id
	
	/** 节点类型       circle,line等*/
	this.type

	this.snapBaseNode

	this.snapNode

	this.jqBaseNodeEl

	this.jqNodeEl


	this.snapBaseNodeCreate = function (vTopo ,__opt){
		this.snapBaseNode = vTopo.snapSvg.paper.g()
		vTopo.vTopoBaseNode.add(this.snapBaseNode)
		this.id = __opt.id || vTopo.uuid++
		registerNode(this)
	}

	this.baseRemove = function (){
		this.snapBaseNode.remove()
		this.snapNode.remove()
		this.snapBaseNode = null
		this.snapNode = null
		this.jqBaseNodeEl = null
		this.jqNodeEl = null
	}
}


export default BaseNode