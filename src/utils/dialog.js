import {splitText} from './index'

export function dialogInput(opt ,vTopo){
	let pos = opt.pos
	let dialogEl = $(`<div class="vTopo-dialog">
						<input />
						<span style="cursor:pointer">提交</span>
					</div>`)
	$('body').append(dialogEl)
	dialogEl.css({"left":pos.left ,"top":pos.top})
	dialogEl.find("span").click(function (){
		var str_array = splitText(dialogEl.find("input").val() ,vTopo)
		opt.enterCbf(str_array)
		dialogEl.remove()
	})
}