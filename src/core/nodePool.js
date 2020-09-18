/** 
	节点池     节点管理中心
*/

var nodePool = []

export default {
	/** 节点注册 */
	register(node){
		nodePool.push(node)
	},
	/** 节点移除 */
	remove(id){
		nodePool = _.filter(nodePool ,(tmp)=>{
			return tmp.id != id
		})
	},
	find(id){
		return _.find(nodePool ,(tmp)=>{
			return tmp.id == id
		})
	},
	list(){
		return nodePool
	}
}

export function registerNode(node){
	nodePool.push(node)
}

export function removeNode(id){
	nodePool = _.filter(nodePool ,(tmp)=>{
		return tmp.id != id
	})
}

export function findNode(id){
	return _.find(nodePool ,(tmp)=>{
		return tmp.id == id
	})
}

export function nodeList(){
	return nodePool
}

export function clearAllNode(){
	nodePool = []
}