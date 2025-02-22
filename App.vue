<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		height: 100%;
	}

	/* 设置底部安全区域变量 */
	:root {
		--safe-area-inset-bottom: 0px;
		--window-bottom: 50px; /* tabBar 高度 */
	}

	/* 设置状态栏高度变量 */
	:root {
		--status-bar-height: 0px;
	}

	/* #ifdef APP-PLUS */
	:root {
		--status-bar-height: 44px;
	}
	/* #endif */
</style>
