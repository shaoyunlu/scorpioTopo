export function getElPosition(jqEl){
	var __attr = jqEl.attr("transform")
	if (!__attr)
		return {left:0 ,top : 0}
	var __array = __attr.replace(")" ,"").split(",")
	return {left:parseInt(__array[4]) ,top : parseInt(__array[5])}
}

export function setElTransform(jqEl ,pos){
	jqEl.attr("transform" ,"matrix(1,0,0,1,"+pos.left+","+pos.top+")")
}

export function getLinePathWithOutStart(jqEl){
	let array_d = jqEl.attr("d").split(" ")
	array_d = array_d.slice(3)
	return array_d.join(" ")
}

export function getLinePathWithoutEnd(jqEl){
	let array_d = jqEl.attr("d").split(" ")
	let array_d_length = array_d.length
	array_d = array_d.slice(0,(array_d_length-3))
	return array_d.join(" ")
}

export function lineIsInNode(jqEl,vTopo){
	var pos = __getLineEndNodePosition(jqEl)
	var flag = false
	var endNode = null
	for (var i = 0; i < vTopo.nodeArray.length; i++) {
		var __pos = vTopo.nodeArray[i].getPosRange()
		if (
			    (pos.left > __pos.x_range[0] && pos.left < __pos.x_range[1]) &&
				(pos.top > __pos.y_range[0] && pos.top < __pos.y_range[1])
			)
		{
			endNode = vTopo.nodeArray[i]
			flag = true
			break
		}
	}
	return endNode
}

// 获取坐标在哪个区间
export function getSpaceIndexFromLine(dstX ,dstY , lineNode){
	dstX = Math.abs(dstX)
	dstY = Math.abs(dstY)
	var __path = lineNode.snapNode.attr("d").split(" ")
	var range = __path.length/3 - 1
	var res = -1
	for (var i = 0; i < range; i++) {
		if (
				( 
					(dstX >= Math.abs(__path[i*3 + 1]) && dstX <= Math.abs(__path[i*3 + 4]))
					||
					(dstX <= Math.abs(__path[i*3 + 1]) && dstX >= Math.abs(__path[i*3 + 4]))
				)
				&&
				(
					(dstY >= Math.abs(__path[i*3 + 2]) && dstY <= Math.abs(__path[i*3 + 5]))
					||
					(dstY <= Math.abs(__path[i*3 + 2]) && dstY >= Math.abs(__path[i*3 + 5]))
				)
			)
		{
			res = i
			break;
		}
	}
	return res
}

export function splitText(textStr ,vTopo)
{
	var textArray = []
	var res = []
	var start_pos = 0
	var digit = 1
	var count = 0
	for (var i = 0; i < textStr.length; i++) {
		if (textStr.charCodeAt(i)>127 || textStr.charCodeAt(i)==94) 
             count += 2
 		else   
             count ++
        if (count == 11 || count == 12)
         	res.push(textStr.substr(start_pos ,digit)) ,count = 0,digit = 1,start_pos = (i+1)
        else
         	digit++
	}
	var res_str = res.join("")
	if (res_str.length != textStr.length)
		res.push(textStr.substr(res_str.length))
	res.forEach(tmp => {
		let __t = $('<span>'+tmp+'</span>').appendTo(vTopo.jqTextSplit)
		textArray.push({text:tmp ,width:__t.width()})
	})
	return textArray
}

export function getEventOffSetX(e ,vTopo){
	return e.pageX - vTopo.jqWrapperElOffset.left
}

export function getEventOffSetY(e ,vTopo){
	return e.pageY - vTopo.jqWrapperElOffset.top
}

function __getLineEndNodePosition(jqEl){
	var array_d = jqEl.attr("d").split(" ")
	var __attr = jqEl.attr("transform")
	var __array = __attr.replace(")" ,"").split(",")
	return {
				left : parseInt(__array[4]) + parseInt(array_d[4]),
				top : parseInt(__array[5]) + parseInt(array_d[5])
			}
}