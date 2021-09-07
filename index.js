const danmuData = [
    {
        content: '哔哩哔哩',
        speed: 2,
        runTime: 1,
        color: 'red'
    },
    {
        content: '哄堂大孝了家人们',
        speed: 4,
        runTime: 8,
        color: 'red'
    },
    {
        content: '嘉然,我的嘉然',
        speed: 2,
        runTime: 6,
        color: 'red'
    },
    {
        content: '呵呵',
        speed: 2,
        runTime: 8,
        color: 'red'
    },
]

//计算弹幕宽度
function getTextWidth(content, fontSize) {
    //创建临时元素,放入弹幕文本,设置文本字体大小
    const _span = document.createElement('span');
    _span.innerText = content;
    _span.style.fontSize = fontSize + 'px';
    _span.style.position = 'absolute';  //改成块级元素
    document.body.appendChild(_span);
    let width = _span.offsetWidth;
    document.body.removeChild(_span);
    return width
}

//计算弹幕位置
function getTextPosition(canvas, fontSize, ctx) {
    let x = canvas.width;
    let y = canvas.height * Math.random();
    if (y < fontSize) {
        y = fontSize
    } else if (y > canvas.height - fontSize) {
        y = canvas.height - fontSize
    }

    ctx.x = x;
    ctx.y = y;

    console.log(ctx.y);
}

//每条弹幕的类
class Danmu {
    constructor(danmu, fuCtx) {
        this.content = danmu.content;
        this.runTime = danmu.runTime;
        this.danmu = danmu;
        this.ctx = fuCtx;
        this.initialize()
    }

    initialize() {
        this.color = this.danmu.color || this.ctx.color;
        this.speed = this.danmu.speed || this.ctx.speed;
        this.fontSize = 30;
        //计算宽度
        this.width = getTextWidth(this.content, this.fontSize);
        //console.log(this.width)
        getTextPosition(this.ctx.canvas, this.fontSize, this)
        //console.log(this)
    }

    //画弹幕
    draw() {
        this.ctx.canvasCtx.font = this.fontSize + 'px Microsoft Yahei'
        this.ctx.canvasCtx.fillStyle = this.color
        this.ctx.canvasCtx.fillText(this.content, this.x, this.y)
    }
}

//判断option
function isObj(value) {
    const type = Object.prototype.toString.call(value)
    return type === '[object Object]'
}
function isArray(value) {
    return Array.isArray(value)
}

//创建弹幕类
class VideoDanmu {
    constructor(video, canvas, options) {
        if (!video || !canvas || !options || !isObj(options)) return
        if (!options.danmuData || !isArray(options.danmuData)) return

        this.video = video
        this.canvas = canvas
        this.canvasCtx = canvas.getContext('2d')
        //canvas宽高和video宽高一样
        this.canvas.width = video.clientWidth
        this.canvas.height = video.clientHeight
        this.danmuPaused = true

        Object.assign(this, options, {
            speed: 2,
            runTime: 0,
            color: '#fff'
        })
        this.danmuPool = this.createDanmupool();  //弹幕划到弹幕上
        //console.log(this.danmuPool)
        this.render();
    }

    createDanmupool() {
        return this.danmuData.map(dm => new Danmu(dm, this))
    }

    render() {
        //清除画布
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawDanmu()
        if (!this.danmuPaused) {
            requestAnimationFrame(this.render.bind(this))
        }
    }

    drawDanmu() {
        let currentTime = this.video.currentTime
        this.danmuPool.map((danmu) => {
            if (!danmu.stopDrawing && currentTime >= danmu.runTime) {
                if (!danmu.isInitialized) {
                    danmu.initialize()
                    danmu.isInitialized = true
                }
                danmu.x -= danmu.speed;
                danmu.draw();

                if (danmu.x <= danmu.width * -1) {
                    danmu.stopDrawing = true
                }
            }
        })
    }

    reset() {
        //清除画布
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        let currentTime = this.video.currentTime

        this.danmuPool.map((danmu => {
            danmu.stopDrawing = false;
            if (currentTime <= danmu.runTime) {
                danmu.isInitialized = false
            } else {
                danmu.stopDrawing = true
            }
        }))
    }
    //添加弹幕
    addDanmu(newDanmu) {
        this.danmuPool.push(new Danmu(newDanmu, this))
    }
}

; ((doc) => {
    const oDanmuVideo = doc.getElementById('video')
    const oDanmuCanvas = doc.getElementById('danmuCanvas')
    const oDanmuInput = doc.getElementsByClassName('danmu-input')
    const oDanmuBtn = doc.getElementById('btn')
    const oDanmuColor = doc.getElementById('color')

    const init = () => {
        window.videoDanmu = new VideoDanmu(
            oDanmuVideo,
            oDanmuCanvas,
            { danmuData }
        )
        bindEvent()
        console.log(oDanmuCanvas.height)
    }

    //绑定事件处理函数的管理函数
    function bindEvent() {
        oDanmuVideo.addEventListener('play', function () {
            videoDanmu.danmuPaused = false;
            videoDanmu.render();
        }, false)

        oDanmuVideo.addEventListener('pause', function () {
            videoDanmu.danmuPaused = true;
        }, false)

        oDanmuVideo.addEventListener('seeked', function () {
            videoDanmu.reset()
        }, false)

        oDanmuBtn.addEventListener('click', function () {
            if (videoDanmu.danmuPaused) return
            const inputValue = oDanmuInput.value.trim()
            if (inputValue.length === 0) return

            const colorValue = oDanmuColor.value;
            const runTime = oDanmuVideo.currentTime;

            const _data = {
                content: inputValue,
                runTime: runTime,
                color: colorValue
            }

            videoDanmu.addDanmu(_data)
            oDanmuInput = '';

            alert('DASKL')
            console.log('jklda')

        }, false)
    }

    init()
})(document);