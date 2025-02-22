if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$7 = {
    setup() {
      const phone = vue.ref("18768880709");
      const code = vue.ref("123456");
      const counting = vue.ref(false);
      const counter = vue.ref(60);
      vue.onMounted(() => {
        phone.value = "18768880709";
        code.value = "123456";
      });
      const getCode = () => {
        if (counting.value)
          return;
        if (!/^1[3-9]\d{9}$/.test(phone.value)) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return;
        }
        uni.showToast({
          title: "验证码已发送",
          icon: "none"
        });
        counting.value = true;
        counter.value = 60;
        const timer = setInterval(() => {
          counter.value--;
          if (counter.value <= 0) {
            clearInterval(timer);
            counting.value = false;
          }
        }, 1e3);
      };
      const handleLogin = () => {
        if (!/^1[3-9]\d{9}$/.test(phone.value)) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return;
        }
        if (!/^\d{6}$/.test(code.value)) {
          uni.showToast({
            title: "请输入正确的验证码",
            icon: "none"
          });
          return;
        }
        if (phone.value === "18768880709" && code.value === "123456") {
          uni.setStorageSync("token", "default_token");
          uni.setStorageSync("userInfo", {
            phone: phone.value
          });
          uni.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.reLaunch({
              url: "/pages/run/run"
            });
          }, 1500);
        } else {
          uni.showToast({
            title: "手机号或验证码错误",
            icon: "none"
          });
        }
      };
      return {
        phone,
        code,
        counting,
        counter,
        getCode,
        handleLogin
      };
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createElementVNode("view", { class: "title" }, "运动助手"),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.phone = $event),
              placeholder: "请输入手机号",
              maxlength: "11"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item code-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.code = $event),
              placeholder: "请输入验证码",
              maxlength: "6"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.code]
          ]),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["get-code", { disabled: $setup.counting }]),
              onClick: _cache[2] || (_cache[2] = (...args) => $setup.getCode && $setup.getCode(...args))
            },
            vue.toDisplayString($setup.counting ? `${$setup.counter}s后重试` : "获取验证码"),
            3
            /* TEXT, CLASS */
          )
        ]),
        vue.createElementVNode("button", {
          class: "login-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $setup.handleLogin && $setup.handleLogin(...args))
        }, "登录")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "/Users/Macx/Desktop/ai项目/run3/pages/login/login.vue"]]);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _sfc_main$6 = {
    props: {
      pace: String,
      distance: Number,
      duration: Number
    },
    setup(props) {
      const lastVoiceTime = vue.ref(0);
      const voiceContext = vue.ref(null);
      vue.watch(() => props.pace, (newPace) => {
        const now = Date.now();
        if (now - lastVoiceTime.value < 3e4)
          return;
        const paceMinutes = parseInt(newPace.split("'")[0]);
        if (paceMinutes < 4) {
          speak("请注意,您的配速过快,建议放慢速度");
        } else if (paceMinutes > 8) {
          speak("加油,可以稍微加快步伐");
        }
        lastVoiceTime.value = now;
      });
      vue.watch(() => props.distance, (newDistance, oldDistance) => {
        if (Math.floor(newDistance / 1e3) > Math.floor(oldDistance / 1e3)) {
          const km = Math.floor(newDistance / 1e3);
          speak(`已完成${km}公里,继续加油`);
        }
      });
      const speak = (text) => {
        if (!voiceContext.value) {
          voiceContext.value = uni.createInnerAudioContext();
        }
        formatAppLog("log", "at components/ai-voice-coach.vue:49", "语音提示:", text);
      };
      return {
        speak
      };
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "voice-coach" });
  }
  const AiVoiceCoach = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-e7e9e886"], ["__file", "/Users/Macx/Desktop/ai项目/run3/components/ai-voice-coach.vue"]]);
  const request = (options) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: {}.VUE_APP_API_URL + options.url,
        method: options.method || "GET",
        data: options.data,
        header: {
          "content-type": "application/json",
          "Authorization": uni.getStorageSync("token") || ""
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            uni.removeStorageSync("token");
            uni.removeStorageSync("userInfo");
            uni.reLaunch({
              url: "/pages/login/login"
            });
          } else {
            reject(res);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  };
  const endRun = (data) => {
    return request({
      url: "/api/run/end",
      method: "POST",
      data
    });
  };
  const _sfc_main$5 = {
    name: "MapView",
    props: {
      location: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        webviewStyles: {
          progress: false,
          background: "#ffffff"
        },
        mapUrl: "/hybrid/html/map.html"
      };
    },
    methods: {
      handleMessage(event) {
        this.$emit("message", event);
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "map-view" }, [
      vue.createElementVNode("web-view", {
        "webview-styles": $data.webviewStyles,
        src: "/hybrid/html/map.html",
        onMessage: _cache[0] || (_cache[0] = (...args) => $options.handleMessage && $options.handleMessage(...args))
      }, null, 40, ["webview-styles"])
    ]);
  }
  const MapView = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-fa941138"], ["__file", "/Users/Macx/Desktop/ai项目/run3/components/run/map-view.vue"]]);
  const _sfc_main$4 = {
    name: "StatsPanel",
    props: {
      distance: {
        type: Number,
        default: 0
      },
      duration: {
        type: Number,
        default: 0
      },
      calories: {
        type: Number,
        default: 0
      },
      heartRate: {
        type: Number,
        default: null
      }
    },
    computed: {
      formatDistance() {
        return (this.distance / 1e3).toFixed(2);
      },
      formatDuration() {
        const minutes = Math.floor(this.duration / 60);
        const seconds = this.duration % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      },
      pace() {
        if (this.distance === 0)
          return `00'00"`;
        const paceSeconds = this.duration / this.distance * 1e3;
        const paceMinutes = Math.floor(paceSeconds / 60);
        const remainSeconds = Math.floor(paceSeconds % 60);
        return `${String(paceMinutes).padStart(2, "0")}'${String(remainSeconds).padStart(2, "0")}"`;
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("cover-view", { class: "data-container" }, [
      vue.createElementVNode("cover-view", { class: "data-content" }, [
        vue.createElementVNode("cover-view", { class: "main-data" }, [
          vue.createElementVNode("cover-view", { class: "data-item" }, [
            vue.createElementVNode(
              "cover-view",
              { class: "value" },
              vue.toDisplayString($options.formatDistance),
              1
              /* TEXT */
            ),
            vue.createElementVNode("cover-view", { class: "label" }, "距离(km)")
          ]),
          vue.createElementVNode("cover-view", { class: "data-item" }, [
            vue.createElementVNode(
              "cover-view",
              { class: "value" },
              vue.toDisplayString($options.formatDuration),
              1
              /* TEXT */
            ),
            vue.createElementVNode("cover-view", { class: "label" }, "时间")
          ]),
          vue.createElementVNode("cover-view", { class: "data-item" }, [
            vue.createElementVNode(
              "cover-view",
              { class: "value" },
              vue.toDisplayString($options.pace),
              1
              /* TEXT */
            ),
            vue.createElementVNode("cover-view", { class: "label" }, "配速")
          ])
        ]),
        vue.createElementVNode("cover-view", { class: "sub-data" }, [
          vue.createElementVNode("cover-view", { class: "stat-box" }, [
            vue.createElementVNode(
              "cover-view",
              { class: "value" },
              vue.toDisplayString($props.calories),
              1
              /* TEXT */
            ),
            vue.createElementVNode("cover-view", { class: "label" }, "消耗(kcal)")
          ]),
          vue.createElementVNode("cover-view", { class: "stat-box" }, [
            vue.createElementVNode(
              "cover-view",
              { class: "value" },
              vue.toDisplayString($props.heartRate || "--"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("cover-view", { class: "label" }, "心率(bpm)")
          ])
        ])
      ])
    ]);
  }
  const StatsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-b0a71ce3"], ["__file", "/Users/Macx/Desktop/ai项目/run3/components/run/stats-panel.vue"]]);
  const _sfc_main$3 = {
    name: "ControlButton",
    props: {
      isRunning: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      handleTap() {
        this.$emit("tap");
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("cover-view", { class: "btn-area" }, [
      vue.createElementVNode(
        "cover-view",
        {
          class: vue.normalizeClass(["run-btn", { "running": $props.isRunning }]),
          onClick: _cache[0] || (_cache[0] = (...args) => $options.handleTap && $options.handleTap(...args))
        },
        [
          vue.createElementVNode(
            "cover-view",
            { class: "btn-text" },
            vue.toDisplayString($props.isRunning ? "结束跑步" : "开始跑步"),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const ControlButton = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-6faca054"], ["__file", "/Users/Macx/Desktop/ai项目/run3/components/run/control-button.vue"]]);
  const _sfc_main$2 = {
    components: {
      AiVoiceCoach,
      MapView,
      StatsPanel,
      ControlButton
    },
    setup() {
      const isRunning = vue.ref(false);
      const location = vue.ref({
        latitude: 39.909,
        longitude: 116.397
      });
      const distance = vue.ref(0);
      const duration = vue.ref(0);
      const polyline = vue.ref([]);
      const markers = vue.ref([]);
      const locationTimer = vue.ref(null);
      const durationTimer = vue.ref(null);
      const trackPoints = vue.ref([]);
      const mapUrl = vue.ref("/hybrid/html/map.html");
      vue.ref(null);
      const retryCount = vue.ref(0);
      const maxRetries = 3;
      const formatDistance = vue.computed(() => {
        return (distance.value / 1e3).toFixed(2);
      });
      const formatDuration = vue.computed(() => {
        const minutes = Math.floor(duration.value / 60);
        const seconds = duration.value % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      });
      const pace = vue.computed(() => {
        if (distance.value === 0)
          return `00'00"`;
        const paceSeconds = duration.value / distance.value * 1e3;
        const paceMinutes = Math.floor(paceSeconds / 60);
        const remainSeconds = Math.floor(paceSeconds % 60);
        return `${String(paceMinutes).padStart(2, "0")}'${String(remainSeconds).padStart(2, "0")}"`;
      });
      const calories = vue.ref(0);
      const heartRate = vue.ref(null);
      const checkAndRequestPermission = () => {
        return new Promise((resolve, reject) => {
          const checkSystemLocation = () => {
            if (plus.os.name === "Android") {
              const context = plus.android.runtimeMainActivity();
              const locationManager = plus.android.importClass("android.location.LocationManager");
              const lm = context.getSystemService("location");
              return lm.isProviderEnabled(locationManager.GPS_PROVIDER);
            }
            return true;
          };
          if (!checkSystemLocation()) {
            uni.showModal({
              title: "提示",
              content: "请开启手机GPS定位功能",
              success: (res) => {
                if (res.confirm) {
                  if (plus.os.name === "Android") {
                    const Intent = plus.android.importClass("android.content.Intent");
                    const Settings = plus.android.importClass("android.provider.Settings");
                    const intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                    plus.android.runtimeMainActivity().startActivity(intent);
                  }
                }
              }
            });
            reject(new Error("GPS未开启"));
            return;
          }
          plus.android.requestPermissions(
            ["android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"],
            function(resultObj) {
              if (resultObj.granted.length === 2) {
                resolve();
              } else {
                uni.showModal({
                  title: "提示",
                  content: "请授予应用位置权限，否则无法使用跑步功能",
                  success: (res) => {
                    if (res.confirm) {
                      if (plus.os.name === "Android") {
                        const Intent = plus.android.importClass("android.content.Intent");
                        const Settings = plus.android.importClass("android.provider.Settings");
                        const Uri = plus.android.importClass("android.net.Uri");
                        const mainActivity = plus.android.runtimeMainActivity();
                        const intent = new Intent();
                        intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                        intent.setData(Uri.fromParts("package", mainActivity.getPackageName(), null));
                        mainActivity.startActivity(intent);
                      }
                    }
                  }
                });
                reject(new Error("未授予位置权限"));
              }
            },
            function(error) {
              reject(error);
            }
          );
        });
      };
      const setWebviewStyle = () => {
        setTimeout(() => {
          const pages = getCurrentPages();
          const page = pages[pages.length - 1];
          const currentWebview = page.$getAppWebview();
          const webviews = currentWebview.children();
          if (webviews && webviews[0]) {
            webviews[0].setStyle({
              height: "50vh",
              background: "#ffffff"
            });
            formatAppLog("log", "at pages/run/run.vue:205", "设置webview样式成功");
          } else {
            formatAppLog("log", "at pages/run/run.vue:207", "未找到webview");
          }
        }, 300);
      };
      const handleMessage = (event) => {
        formatAppLog("log", "at pages/run/run.vue:219", "收到地图消息:", event);
        const message = event.detail || {};
        if (message.type === "mapReady") {
          updateMapLocation(location.value);
          setWebviewStyle();
        }
      };
      const updateMapLocation = (loc) => {
        if (!loc || !loc.latitude || !loc.longitude) {
          formatAppLog("error", "at pages/run/run.vue:230", "无效的位置数据:", loc);
          return;
        }
        const message = {
          type: "updateLocation",
          latitude: loc.latitude,
          longitude: loc.longitude
        };
        formatAppLog("log", "at pages/run/run.vue:239", "发送位置更新:", message);
        const mapWebview = plus.webview.getWebviewById("map-webview");
        if (mapWebview) {
          const messageStr = JSON.stringify(message);
          mapWebview.evalJS(`
          try {
            window.postMessage(${messageStr}, '*');
          } catch(e) {
            __f__('error','at pages/run/run.vue:250','发送消息失败:', e);
          }
        `);
        } else {
          formatAppLog("error", "at pages/run/run.vue:254", "未找到地图webview");
        }
      };
      const toggleRun = async () => {
        if (!isRunning.value) {
          try {
            await checkAndRequestPermission();
            uni.showLoading({
              title: "定位中..."
            });
            const gpsStatus = await checkGPSStatus();
            if (!gpsStatus) {
              throw new Error("请开启GPS定位功能");
            }
            retryCount.value = 0;
            const res = await getLocationWithRetry();
            uni.hideLoading();
            formatAppLog("log", "at pages/run/run.vue:279", "获取到位置:", res);
            location.value = res;
            isRunning.value = true;
            setTimeout(() => {
              updateMapLocation(res);
            }, 2e3);
            startTracking();
          } catch (err) {
            uni.hideLoading();
            formatAppLog("error", "at pages/run/run.vue:292", "开始跑步失败:", err);
            uni.showToast({
              title: err.message || "定位失败，请检查GPS和网络状态",
              icon: "none",
              duration: 3e3
            });
          }
        } else {
          stopTracking();
          isRunning.value = false;
          const pages = getCurrentPages();
          const page = pages[pages.length - 1];
          const currentWebview = page.$getAppWebview();
          const webviews = currentWebview.children();
          const mapWebview = webviews.find((v) => v.getURL().includes("map.html"));
          if (mapWebview) {
            mapWebview.evalJS(`
            if (window.postMessage) {
              window.postMessage({ type: 'reset' }, '*');
            }
          `);
          }
          try {
            const runData = {
              distance: distance.value,
              duration: duration.value,
              pace: pace.value
            };
            await endRun(runData);
            uni.showToast({
              title: "完成跑步! 获得5积分",
              icon: "none"
            });
          } catch (err) {
            uni.showToast({
              title: "上传跑步数据失败",
              icon: "none"
            });
          }
          resetRunData();
        }
      };
      const checkGPSStatus = () => {
        return new Promise((resolve) => {
          if (plus.os.name === "Android") {
            const context = plus.android.runtimeMainActivity();
            const locationManager = plus.android.importClass("android.location.LocationManager");
            const lm = context.getSystemService("location");
            if (!lm.isProviderEnabled(locationManager.GPS_PROVIDER)) {
              uni.showModal({
                title: "提示",
                content: "请开启GPS定位功能",
                confirmText: "去开启",
                success: (res) => {
                  if (res.confirm) {
                    const Intent = plus.android.importClass("android.content.Intent");
                    const Settings = plus.android.importClass("android.provider.Settings");
                    const intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                    context.startActivity(intent);
                  }
                }
              });
              resolve(false);
            } else {
              resolve(true);
            }
          } else {
            resolve(true);
          }
        });
      };
      const getLocationWithRetry = async () => {
        try {
          formatAppLog("log", "at pages/run/run.vue:377", `尝试获取位置，第${retryCount.value + 1}次`);
          return new Promise((resolve, reject) => {
            uni.getLocation({
              type: "gcj02",
              isHighAccuracy: true,
              timeout: 15e3,
              provider: "system",
              geocode: true,
              altitude: true,
              // 获取海拔高度
              success: (res) => {
                formatAppLog("log", "at pages/run/run.vue:387", "定位成功:", res);
                if (res.latitude && res.longitude) {
                  resolve(res);
                } else {
                  reject(new Error("获取到的坐标无效"));
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/run/run.vue:396", "定位失败:", err);
                reject(err);
              }
            });
          });
        } catch (err) {
          if (retryCount.value < maxRetries) {
            retryCount.value++;
            await new Promise((resolve) => setTimeout(resolve, 1e3));
            return getLocationWithRetry();
          }
          throw err;
        }
      };
      const startTracking = () => {
        locationTimer.value = setInterval(() => {
          uni.getLocation({
            type: "gcj02",
            isHighAccuracy: true,
            timeout: 1e4,
            provider: "system",
            geocode: true,
            altitude: true,
            success: (res) => {
              formatAppLog("log", "at pages/run/run.vue:422", "位置更新:", res);
              if (res.latitude && res.longitude) {
                location.value = res;
                updateMapLocation(res);
                if (trackPoints.value.length > 0) {
                  const lastPoint = trackPoints.value[trackPoints.value.length - 1];
                  const newDistance = calculateDistance(
                    lastPoint[1],
                    lastPoint[0],
                    res.latitude,
                    res.longitude
                  );
                  if (newDistance > 0.5 && newDistance < 100) {
                    distance.value += newDistance;
                    trackPoints.value.push([res.longitude, res.latitude]);
                  }
                } else {
                  trackPoints.value.push([res.longitude, res.latitude]);
                }
              }
            },
            fail: (err) => {
              formatAppLog("error", "at pages/run/run.vue:444", "位置更新失败:", err);
            }
          });
        }, 3e3);
        durationTimer.value = setInterval(() => {
          duration.value++;
        }, 1e3);
        if (distance.value > 0) {
          calories.value = Math.round(distance.value / 1e3 * 60);
        }
      };
      const stopTracking = () => {
        clearInterval(locationTimer.value);
        clearInterval(durationTimer.value);
      };
      const resetRunData = () => {
        distance.value = 0;
        duration.value = 0;
        polyline.value = [];
        trackPoints.value = [];
      };
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      const createMapWebview = () => {
        try {
          const currentWebview = plus.webview.currentWebview();
          const mapWebview = plus.webview.create("/hybrid/html/map.html", "map-webview", {
            top: "0px",
            height: "50vh",
            width: "100%",
            position: "static",
            background: "transparent",
            // 添加背景透明
            render: "always",
            // 保持渲染
            kernel: "WKWebview"
            // 使用 WKWebview 内核
          });
          currentWebview.append(mapWebview);
          mapWebview.addEventListener("loaded", () => {
            formatAppLog("log", "at pages/run/run.vue:506", "地图加载完成");
            mapWebview.evalJS(`
            if (window.map) {
              window.map.enableScrollWheelZoom(true);
              window.map.enableDragging();
            }
          `);
            if (location.value) {
              setTimeout(() => {
                updateMapLocation(location.value);
              }, 500);
            }
          });
          return mapWebview;
        } catch (err) {
          formatAppLog("error", "at pages/run/run.vue:524", "创建地图webview失败:", err);
          return null;
        }
      };
      const webviewStyles = {
        progress: false,
        // 是否显示进度条
        background: "#ffffff"
        // webview 背景色
      };
      vue.onMounted(() => {
        setTimeout(() => {
          const mapWebview = createMapWebview();
          if (!mapWebview) {
            uni.showToast({
              title: "创建地图失败",
              icon: "none"
            });
            return;
          }
        }, 500);
        uni.getLocation({
          type: "gcj02",
          isHighAccuracy: true,
          success: (res) => {
            formatAppLog("log", "at pages/run/run.vue:559", "初始化位置:", res);
            location.value = res;
            setTimeout(() => {
              updateMapLocation(res);
            }, 1500);
          },
          fail: (err) => {
            formatAppLog("error", "at pages/run/run.vue:567", "初始化位置获取失败:", err);
            uni.showToast({
              title: "获取位置失败，请检查定位权限",
              icon: "none"
            });
          }
        });
      });
      vue.onUnmounted(() => {
        const mapWebview = plus.webview.getWebviewById("map-webview");
        if (mapWebview) {
          mapWebview.close();
        }
        stopTracking();
      });
      return {
        isRunning,
        location,
        distance,
        duration,
        polyline,
        markers,
        formatDistance,
        formatDuration,
        pace,
        mapUrl,
        toggleRun,
        handleMessage,
        calories,
        heartRate,
        webviewStyles
      };
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 地图区域 "),
      vue.createElementVNode("view", { class: "map-view" }, [
        vue.createElementVNode("web-view", {
          "webview-styles": $setup.webviewStyles,
          src: "/hybrid/html/map.html",
          onMessage: _cache[0] || (_cache[0] = (...args) => $setup.handleMessage && $setup.handleMessage(...args))
        }, null, 40, ["webview-styles"])
      ]),
      vue.createCommentVNode(" 使用cover-view显示数据 "),
      vue.createElementVNode("cover-view", { class: "data-container" }, [
        vue.createElementVNode("cover-view", { class: "data-content" }, [
          vue.createCommentVNode(" 主要数据 "),
          vue.createElementVNode("cover-view", { class: "main-data" }, [
            vue.createElementVNode("cover-view", { class: "data-item" }, [
              vue.createElementVNode(
                "cover-view",
                { class: "value" },
                vue.toDisplayString($setup.formatDistance),
                1
                /* TEXT */
              ),
              vue.createElementVNode("cover-view", { class: "label" }, "距离(km)")
            ]),
            vue.createElementVNode("cover-view", { class: "data-item" }, [
              vue.createElementVNode(
                "cover-view",
                { class: "value" },
                vue.toDisplayString($setup.formatDuration),
                1
                /* TEXT */
              ),
              vue.createElementVNode("cover-view", { class: "label" }, "时间")
            ]),
            vue.createElementVNode("cover-view", { class: "data-item" }, [
              vue.createElementVNode(
                "cover-view",
                { class: "value" },
                vue.toDisplayString($setup.pace),
                1
                /* TEXT */
              ),
              vue.createElementVNode("cover-view", { class: "label" }, "配速")
            ])
          ]),
          vue.createCommentVNode(" 次要数据 "),
          vue.createElementVNode("cover-view", { class: "sub-data" }, [
            vue.createElementVNode("cover-view", { class: "stat-box" }, [
              vue.createElementVNode(
                "cover-view",
                { class: "value" },
                vue.toDisplayString($setup.calories),
                1
                /* TEXT */
              ),
              vue.createElementVNode("cover-view", { class: "label" }, "消耗(kcal)")
            ]),
            vue.createElementVNode("cover-view", { class: "stat-box" }, [
              vue.createElementVNode(
                "cover-view",
                { class: "value" },
                vue.toDisplayString($setup.heartRate || "--"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("cover-view", { class: "label" }, "心率(bpm)")
            ])
          ]),
          vue.createCommentVNode(" 按钮区域 "),
          vue.createElementVNode("cover-view", { class: "btn-area" }, [
            vue.createElementVNode(
              "cover-view",
              {
                class: vue.normalizeClass(["run-btn", { "running": $setup.isRunning }]),
                onClick: _cache[1] || (_cache[1] = (...args) => $setup.toggleRun && $setup.toggleRun(...args))
              },
              [
                vue.createElementVNode(
                  "cover-view",
                  { class: "btn-text" },
                  vue.toDisplayString($setup.isRunning ? "结束跑步" : "开始跑步"),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            )
          ])
        ])
      ])
    ]);
  }
  const PagesRunRun = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "/Users/Macx/Desktop/ai项目/run3/pages/run/run.vue"]]);
  const _sfc_main$1 = {
    setup() {
      const userInfo = vue.reactive({
        nickname: "跑步达人",
        points: 100,
        totalDistance: 25.6,
        totalDuration: 3.5,
        totalRuns: 12,
        address: null
      });
      const rewards = vue.ref([
        {
          id: 1,
          name: "运动水壶",
          points: 50,
          image: "/static/rewards/bottle.jpg"
        },
        {
          id: 2,
          name: "运动手环",
          points: 200,
          image: "/static/rewards/band.jpg"
        },
        {
          id: 3,
          name: "跑步鞋",
          points: 500,
          image: "/static/rewards/shoes.jpg"
        }
      ]);
      const selectedReward = vue.ref({});
      const addressForm = vue.reactive({
        name: "",
        phone: "",
        address: ""
      });
      const exchangePopup = vue.ref(null);
      const addressPopup = vue.ref(null);
      const handleExchange = (reward) => {
        if (userInfo.points < reward.points) {
          uni.showToast({
            title: "积分不足",
            icon: "none"
          });
          return;
        }
        selectedReward.value = reward;
        exchangePopup.value.open();
      };
      const showAddressEdit = () => {
        if (userInfo.address) {
          addressForm.name = userInfo.address.name;
          addressForm.phone = userInfo.address.phone;
          addressForm.address = userInfo.address.address;
        }
        addressPopup.value.open();
      };
      const saveAddress = () => {
        if (!addressForm.name || !addressForm.phone || !addressForm.address) {
          uni.showToast({
            title: "请填写完整信息",
            icon: "none"
          });
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(addressForm.phone)) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return;
        }
        userInfo.address = { ...addressForm };
        addressPopup.value.close();
      };
      const confirmExchange = () => {
        if (!userInfo.address) {
          uni.showToast({
            title: "请先添加收货地址",
            icon: "none"
          });
          return;
        }
        userInfo.points -= selectedReward.value.points;
        uni.showToast({
          title: "兑换成功",
          icon: "success"
        });
        exchangePopup.value.close();
      };
      return {
        userInfo,
        rewards,
        selectedReward,
        addressForm,
        exchangePopup,
        addressPopup,
        handleExchange,
        showAddressEdit,
        saveAddress,
        confirmExchange,
        closeExchangePopup: () => exchangePopup.value.close(),
        closeAddressPopup: () => addressPopup.value.close()
      };
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = vue.resolveComponent("uni-popup");
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createCommentVNode(" 用户信息 "),
      vue.createElementVNode("view", { class: "user-info" }, [
        vue.createElementVNode("image", {
          class: "avatar",
          src: "/static/default-avatar.png"
        }),
        vue.createElementVNode("view", { class: "info" }, [
          vue.createElementVNode(
            "text",
            { class: "nickname" },
            vue.toDisplayString($setup.userInfo.nickname || "未登录"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "points" }, [
            vue.createElementVNode("text", { class: "label" }, "我的积分:"),
            vue.createElementVNode(
              "text",
              { class: "value" },
              vue.toDisplayString($setup.userInfo.points || 0),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 运动数据 "),
      vue.createElementVNode("view", { class: "stats-card" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.userInfo.totalDistance || 0),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "label" }, "总里程(km)")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.userInfo.totalDuration || 0),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "label" }, "总时长(h)")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.userInfo.totalRuns || 0),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "label" }, "跑步次数")
        ])
      ]),
      vue.createCommentVNode(" 奖品列表 "),
      vue.createElementVNode("view", { class: "rewards-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "可兑换奖品"),
        vue.createElementVNode("scroll-view", {
          class: "rewards-list",
          "scroll-y": ""
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.rewards, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["reward-item", { "disabled": $setup.userInfo.points < item.points }]),
                key: item.id,
                onClick: ($event) => $setup.handleExchange(item)
              }, [
                vue.createElementVNode("image", {
                  class: "reward-image",
                  src: item.image,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "reward-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "points" },
                    vue.toDisplayString(item.points) + "积分",
                    1
                    /* TEXT */
                  )
                ])
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 兑换弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "exchangePopup",
          type: "center"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "exchange-popup" }, [
              vue.createElementVNode("view", { class: "popup-title" }, "确认兑换"),
              vue.createElementVNode("view", { class: "popup-content" }, [
                vue.createElementVNode("view", { class: "reward-detail" }, [
                  vue.createElementVNode("image", {
                    src: $setup.selectedReward.image,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "detail-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "name" },
                      vue.toDisplayString($setup.selectedReward.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "points" },
                      vue.toDisplayString($setup.selectedReward.points) + "积分",
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "address-section" }, [
                  vue.createElementVNode("view", { class: "section-title" }, "收货地址"),
                  $setup.userInfo.address ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "saved-address",
                    onClick: _cache[0] || (_cache[0] = (...args) => $setup.showAddressEdit && $setup.showAddressEdit(...args))
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "name" },
                      vue.toDisplayString($setup.userInfo.address.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "phone" },
                      vue.toDisplayString($setup.userInfo.address.phone),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "address" },
                      vue.toDisplayString($setup.userInfo.address.address),
                      1
                      /* TEXT */
                    )
                  ])) : (vue.openBlock(), vue.createElementBlock("button", {
                    key: 1,
                    class: "add-address-btn",
                    onClick: _cache[1] || (_cache[1] = (...args) => $setup.showAddressEdit && $setup.showAddressEdit(...args))
                  }, "添加收货地址"))
                ])
              ]),
              vue.createElementVNode("view", { class: "popup-buttons" }, [
                vue.createElementVNode("button", {
                  class: "cancel-btn",
                  onClick: _cache[2] || (_cache[2] = (...args) => $setup.closeExchangePopup && $setup.closeExchangePopup(...args))
                }, "取消"),
                vue.createElementVNode("button", {
                  class: "confirm-btn",
                  onClick: _cache[3] || (_cache[3] = (...args) => $setup.confirmExchange && $setup.confirmExchange(...args))
                }, "确认兑换")
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      vue.createCommentVNode(" 地址编辑弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "addressPopup",
          type: "center"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "address-popup" }, [
              vue.createElementVNode(
                "view",
                { class: "popup-title" },
                vue.toDisplayString($setup.userInfo.address ? "编辑地址" : "新增地址"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "form" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "input",
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.addressForm.name = $event),
                    placeholder: "收货人姓名"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.addressForm.name]
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "input",
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.addressForm.phone = $event),
                    type: "number",
                    maxlength: "11",
                    placeholder: "手机号码"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.addressForm.phone]
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "input",
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.addressForm.address = $event),
                    placeholder: "详细地址"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.addressForm.address]
                ])
              ]),
              vue.createElementVNode("view", { class: "popup-buttons" }, [
                vue.createElementVNode("button", {
                  class: "cancel-btn",
                  onClick: _cache[7] || (_cache[7] = (...args) => $setup.closeAddressPopup && $setup.closeAddressPopup(...args))
                }, "取消"),
                vue.createElementVNode("button", {
                  class: "confirm-btn",
                  onClick: _cache[8] || (_cache[8] = (...args) => $setup.saveAddress && $setup.saveAddress(...args))
                }, "保存")
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "/Users/Macx/Desktop/ai项目/run3/pages/profile/profile.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/run/run", PagesRunRun);
  __definePage("pages/profile/profile", PagesProfileProfile);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/Macx/Desktop/ai项目/run3/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
