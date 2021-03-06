function ViewWidget(
	window,
	document, 
	canvas,
	over
) {
	var self = this;
	var gPassive = false

	var gWidth = 0
	var gHeight = 0

	var gTouch = null;
	var gOverTouch = null;

	var gOldBlock = null;
	var gDebugMode = false;
	var gRetina = 1;

	var gOrigin = new Point(0, 0);
	var gLeft = 0;
	var gTop = 0
	var gZoom = 1.0;
	var gPrevZoom = gZoom;
	var gTempOrigin = new Point(0, 0);

	var gMouse = new Point(0, 0);

	var gPayload = null;

	var gZooms = [
		0.25, 1/3, 0.4, 0.5, 0.6, 2/3, 0.7, 0.8, 0.9, 1,
		1.2, 1.25, 1.5, 1.75, 2
	];

	var BACK_MARGIN = 1000;
	var INNER_MARGIN = 0;
	if (gDebugMode) {
		INNER_MARGIN = 200;
	}
	
	var PATCH_COUNT = 1;



	create();

// Autogenerated with DRAKON Editor 1.32


function Point(x, y) {
    // item 208
    this.x = x;
    this.y = y;
}

function Size(w, h) {
    // item 220
    this.w = w;
    this.h = h;
}

function Timers() {
    // item 781
    this.timers = {};
    this.add = timersAdd;
    this.clear = timersClear;
    this.remove = timersRemove;
}

function adjustOriginToZoom(at, newZoom) {
    // item 1413
    var sx = at.x;
    var sy = at.y;
    // item 1412
    var dx = sx / gZoom - getOriginX();
    var dy = sy / gZoom - getOriginY();
    // item 1414
    var ox = Math.round(sx / newZoom - dx);
    var oy = Math.round(sy / newZoom - dy);
    // item 1415
    return new Point(ox, oy);
}

function bind(name, callback) {
    // item 1487
    canvas.addEventListener(name, callback, getListenOptions())
}

function bindMouseWheel(element, callback) {
    // item 1290
    // IE9, Chrome, Safari, Opera
    element.addEventListener("mousewheel", callback, getListenOptions());
    // Firefox
    element.addEventListener("DOMMouseScroll", callback, getListenOptions());
}

function buildWheelMessage(evt) {
    // item 1313
    var delta = calculateWheelDelta(evt);
    // item 1315
    preventDefault(evt);
    // item 1314
    var message = {
    	delta: delta,
    	shiftKey: evt.shiftKey,
    	ctrlKey: evt.ctrlKey || evt.metaKey
    };
    // item 1316
    return message;
}

function calculateWheelDelta(e) {
    // item 1275
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    // item 1276
    return delta;
}

function clientToDiagram(cx, cy) {
    // item 980
    var mx = Math.round((cx - gLeft) / gZoom - getOriginX())
    var my = Math.round((cy - gTop) / gZoom - getOriginY())
    // item 981
    return {
    	x: mx,
    	y: my,
    	cx: cx,
    	cy: cy
    }
}

function colorFromCoord(row, column) {
    // item 538
    var r = 255;
    var g = Math.floor((row % 500) / 500.0 * 255);
    var b = Math.floor((column % 500) / 500.0 * 255);
    // item 540
    var rh = toHexByte(r);
    var gh = toHexByte(g);
    var bh = toHexByte(b);
    // item 539
    return "#" + rh + gh + bh;
}

function create() {
    // item 763
    gRetina = HtmlUtils.getRetinaFactor()
    // item 1430
    gTouch = new Multitouch(self);
    // item 1578
    //detectPassive()
    // item 1431
    bind("mousedown", mouseDown);
    bind("mousemove", mouseMove);
    bind("mouseup", mouseUp);
    // item 1489
    bind("touchstart", touchstart);
    bind("touchmove", touchmove);
    bind("touchend", touchend);
    bind("touchcancel", touchcancel);
    // item 1262
    bindMouseWheel(canvas, mouseWheel);
    bindMouseWheel(over, mouseWheel);
    // item 995
    canvas.oncontextmenu = function() { return false; }
    // item 1495
    canvas.onmouseleave = mouseLeave
}

function detectPassive() {
    // item 1583
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {}
    // item 1584
    gPassive = supportsPassive
}

function diagramToClient(x, y) {
    // item 1235
    var tx = x;
    var ty = y;
    // item 1236
    var bx = tx + INNER_MARGIN;
    var by = ty + INNER_MARGIN;
    // item 1237
    var mx = Math.round(gZoom * (bx + getOriginX()));
    var my = Math.round(gZoom * (by + getOriginY()));
    // item 1238
    return new Utils.Point(mx, my);
}

function drawPatch() {
    // item 1520
    var background = gPayload.getBackground()
    background = background || Theme.get("back")
    // item 1521
    if (canvas.style.background == background) {
        
    } else {
        // item 1524
        canvas.style.background = background
    }
    // item 743
    var origin = gOrigin;
    // item 739
    var ctx = canvas.getContext("2d");
    // item 741
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // item 742
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // item 1320
    var scale = gZoom * gRetina
    // item 749
    ctx.scale(scale, scale);
    // item 740
    ctx.translate(
    	origin.x,
    	origin.y
    );
    // item 1570
    gPayload.setTransform(origin.x, origin.y, gZoom, gRetina)
    // item 744
    gPayload.draw(ctx)
}

function finishScroll() {
    
}

function finishZoom() {
    // item 1397
    gPayload.setZoom(gZoom, gRetina);
    gPayload.redrawCache();
    // item 1307
    rebuild();
}

function getListenOptions() {
    // item 1590
    if (gPassive) {
        // item 1589
        return {
        	capture: true,
        	passive: true
        }
    } else {
        // item 1593
        return true
    }
}

function getOriginX() {
    // item 1608
    return gOrigin.x
}

function getOriginY() {
    // item 1612
    return gOrigin.y
}

function getRetinaFactor() {
    // item 1441
    return gRetina;
}

function getTargetSize() {
    // item 379
    var rect = canvas.getBoundingClientRect();
    gLeft = rect.left
    gTop = rect.top
    // item 380
    var tw = Math.max(10, rect.width);
    var th = Math.max(10, rect.height);
    // item 377
    return new Size(tw, th);
}

function getVisibleBox() {
    // item 1563
    var left = -getOriginX()
    var top = -getOriginY()
    var right = left + gWidth / gZoom
    var bottom = top + gHeight / gZoom
    // item 1564
    var box = new Utils.Box(
    	left,
    	top,
    	right,
    	bottom
    );
    // item 1565
    return box
}

function getZoom() {
    // item 1395
    return gZoom;
}

function hideOver() {
    // item 1171
    over.style.display = "none";
    // item 1219
    var ctx = over.getContext("2d");
    // item 1220
    ctx.clearRect(0, 0, over.width, over.height);
}

function incomingClick(evt) {
    // item 1554
    CallTrace.add(
    	"vw:incomingClick", []
    )
    // item 1553
    mouseDownCore(evt, false)
    // item 1099
    mouseUp(evt)
}

function mouseDown(evt) {
    // item 1525
    mouseDownCore(evt, true)
}

function mouseDownCore(evt, reset) {
    // item 1550
    if (reset) {
        // item 1548
        CallTrace.reset()
    }
    // item 1544
    preventDefault(evt);
    // item 1545
    gMouse.x = evt.clientX;
    gMouse.y = evt.clientY;
    // item 1546
    var message = toDiagram(evt);
    // item 1566
    if (evt.ctrlKey) {
        // item 1569
        message.button = 2
    }
    // item 1549
    CallTrace.add(
    	"vw:mouseDown",
    	[message.x, message.y,
    	message.cx, message.cy,
    	message.button]
    )
    // item 1547
    gPayload.mouseDown(message);
}

function mouseLeave(evt) {
    // item 1536
    CallTrace.add(
    	"vw:mouseLeave", []
    )
    // item 1504
    if (evt.buttons == 0) {
        
    } else {
        // item 1507
        mouseUp(evt)
    }
}

function mouseMove(evt) {
    // item 1030
    preventDefault(evt);
    // item 1032
    var dx = evt.clientX - gMouse.x;
    var dy = evt.clientY - gMouse.y;
    // item 1033
    var mouseClient = toDiagram(evt);
    // item 1034
    var message = {
    	x: mouseClient.x,
    	y: mouseClient.y,
    	dx: dx / gZoom,
    	dy: dy / gZoom,
    	cx: evt.clientX,
    	cy: evt.clientY
    };
    // item 1031
    gMouse.x = evt.clientX;
    gMouse.y = evt.clientY;
    // item 1035
    gPayload.mouseMove(message);
}

function mouseUp(evt) {
    // item 1018
    preventDefault(evt);
    // item 1019
    var message = toDiagram(evt);
    // item 1537
    CallTrace.add(
    	"vw:mouseUp",
    	[message.x, message.y,
    	message.cx, message.cy,
    	message.button]
    )
    // item 1020
    gPayload.mouseUp(message);
}

function mouseWheel(evt) {
    // item 1317
    var message = buildWheelMessage(evt);
    // item 1538
    CallTrace.add(
    	"vw:mouseWheel",
    	[message.delta, message.shiftKey,
    	message.ctrlKey]
    )
    // item 1291
    gPayload.mouseWheel(message);
}

function pan(ox, oy) {
    // item 1143
    gOrigin = new Point(ox, oy);
    // item 1144
    redrawLater();
}

function preventDefault(evt) {
    // item 344
    if (evt.preventDefault) {
        // item 343
        evt.preventDefault();
    } else {
        // item 347
        evt.returnValue = false;
    }
}

function randomColor() {
    // item 336
    var r = randomHexByte();
    var g = randomHexByte();
    var b = randomHexByte();
    // item 337
    return "#" + r + g + b;
}

function randomHexByte() {
    // item 326
    var value = Math.floor(Math.random() * 128);
    // item 327
    return toHexByte(value);
}

function rebuild() {
    // item 1342
    gTempOrigin = new Point(
    	getOriginX(),
    	getOriginY()
    );
    // item 1104
    var tSize = getTargetSize();
    // item 1558
    gWidth = tSize.w
    gHeight = tSize.h
    // item 1407
    setupCanvas(canvas, tSize.w, tSize.h);
    // item 1408
    drawPatch();
    // item 1252
    setupCanvas(over, tSize.w, tSize.h);
}

function redraw() {
    // item 1410
    drawPatch();
}

function redrawLater() {
    // item 1435
    window.requestAnimationFrame(drawPatch);
}

function scrollBy(dx, dy) {
    // item 1613
    var ox = getOriginX()
    var oy = getOriginY()
    // item 1614
    setOrigin(
    	ox + dx,
    	oy + dy
    )
    // item 1436
    redrawLater();
}

function selectBlock(box) {
    // item 1229
    var ctx = over.getContext("2d");
    // item 1222
    if (gOldBlock) {
        // item 1225
        var width = gOldBlock.right - gOldBlock.left + 6;
        var height = gOldBlock.bottom - gOldBlock.top + 6;
        // item 1221
        ctx.clearRect(
        	gOldBlock.left - 3, 
        	gOldBlock.top - 3,
        	width,
        	height
        );
    }
    // item 1253
    if (box) {
        // item 1239
        var leftTop = diagramToClient(box.left, box.top);
        var rightBottom = diagramToClient(box.right, box.bottom);
        // item 1260
        ctx.lineWidth = 2 * gRetina
        // item 1259
        leftTop.x *= gRetina
        leftTop.y *= gRetina
        rightBottom.x *= gRetina
        rightBottom.y *= gRetina
        // item 1226
        var newBox = new Utils.Box(
        	leftTop.x,
        	leftTop.y,
        	rightBottom.x,
        	rightBottom.y
        );
        // item 1227
        var width2 = newBox.right - newBox.left;
        var height2 = newBox.bottom - newBox.top;
        // item 1228
        ctx.strokeStyle = Theme.get("line")
        ctx.strokeRect(
        	newBox.left,
        	newBox.top,
        	width2,
        	height2
        );
    }
    // item 1240
    gOldBlock = newBox;
}

function setCursor(cursor) {
    // item 1449
    canvas.style.cursor = cursor;
}

function setOrigin(ox, oy) {
    // item 1599
    gOrigin.x = ox
    gOrigin.y = oy
    // item 1600
    if (self.onOriginChanged) {
        // item 1603
        self.onOriginChanged(
        	gOrigin.x,
        	gOrigin.y
        )
    }
}

function setPayload(payload) {
    // item 1131
    gPayload = payload;
    // item 1494
    gTouch.setBeh(gPayload);
    // item 1399
    gPayload.setZoom(gZoom, gRetina);
}

function setupCanvas(canvas, w, h) {
    // item 1250
    canvas.width = w * gRetina
    canvas.height = h * gRetina
}

function showOver() {
    // item 1172
    over.style.display = "inline-block"
}

function timersAdd(id, callback, milliseconds) {
    // item 804
    var me = this;
    // item 802
    var wrappedCallback = function() {
    	delete me.timers[id];
    	callback(id);
    	rebuild();
    }
    // item 799
    this.timers[id] = window.setTimeout(
    	wrappedCallback,
    	milliseconds
    );
}

function timersClear() {
    // item 803
    var ids = Object.keys(this.timers);
    // item 7970001
    var _ind797 = 0;
    var _col797 = ids;
    var _len797 = _col797.length;
    while (true) {
        // item 7970002
        if (_ind797 < _len797) {
            
        } else {
            break;
        }
        // item 7970004
        var id = _col797[_ind797];
        // item 791
        this.remove(id);
        // item 7970003
        _ind797++;
    }
}

function timersRemove(id) {
    // item 800
    var timer = this.timers[id];
    // item 801
    delete this.timers[id];
    window.clearInterval(timer);
}

function toDiagram(evt) {
    // item 1455
    var cx = evt.clientX;
    var cy = evt.clientY;
    // item 1456
    var result = clientToDiagram(cx, cy);
    result.button = evt.button;
    result.dx = evt.dx / gZoom;
    result.dy = evt.dy / gZoom;
    // item 1457
    return result;
}

function toHexByte(value) {
    // item 532
    var hex = value.toString(16);
    // item 527
    if (hex.length < 2) {
        // item 530
        return "0" + hex;
    } else {
        // item 531
        return hex;
    }
}

function touchcancel(evt) {
    // item 1555
    CallTrace.add(
    	"vw:touchcancel", []
    )
    // item 1518
    DTools.print("cancel touch vw")
    // item 1493
    preventDefault(evt);
    // item 1481
    gTouch.touchcancel(evt);
}

function touchend(evt) {
    // item 1556
    CallTrace.add(
    	"vw:touchend", [evt]
    )
    // item 1517
    DTools.print("end touch vw")
    // item 1490
    preventDefault(evt);
    // item 1475
    gTouch.touchend(evt);
}

function touchmove(evt) {
    // item 1516
    DTools.print("move touch vw")
    // item 1491
    preventDefault(evt);
    // item 1469
    gTouch.touchmove(evt);
}

function touchstart(evt) {
    // item 1533
    CallTrace.reset()
    // item 1557
    CallTrace.add(
    	"vw:touchstart", [evt]
    )
    // item 1519
    DTools.clear()
    // item 1515
    DTools.print("start touch vw")
    // item 1492
    preventDefault(evt);
    // item 1463
    gTouch.touchstart(evt);
}

function zoomAt(center, newZoom) {
    // item 1425
    newZoom = Math.max(0.2, Math.min(3, newZoom));
    // item 1426
    gOrigin = adjustOriginToZoom(center, newZoom);
    gZoom = newZoom;
    // item 1427
    redraw();
}

function zoomBy(amount) {
    // item 1442
    //var newZoom = gZoom * (1 + amount / 500.0);
    // item 1428
    //zoomAt(gMouse, newZoom);
    // item 1573
    if (amount > 0) {
        // item 1576
        zoomIn()
    } else {
        // item 1577
        zoomOut()
    }
}

function zoomIn() {
    // item 1383
    var i;
    // item 13840001
    i = 0;
    while (true) {
        // item 13840002
        if (i < gZooms.length) {
            
        } else {
            break;
        }
        // item 1386
        var zoom = gZooms[i];
        // item 1387
        if (zoom > gZoom) {
            // item 1572
            zoomAt(gMouse, zoom)
            break;
        }
        // item 13840003
        i++;
    }
}

function zoomOut() {
    // item 1374
    var i;
    // item 13750001
    i = gZooms.length - 1;
    while (true) {
        // item 13750002
        if (i >= 0) {
            
        } else {
            break;
        }
        // item 1377
        var zoom = gZooms[i];
        // item 1378
        if (zoom < gZoom) {
            // item 1571
            zoomAt(gMouse, zoom)
            break;
        }
        // item 13750003
        i--;
    }
}

function zoomTo(newZoom) {
    // item 1418
    var size = getTargetSize();
    var at = new Point(size.w / 2, size.h / 2);
    // item 1362
    gOrigin = adjustOriginToZoom(at, newZoom);
    gZoom = newZoom;
    // item 1363
    finishZoom();
}


	this.rebuild = rebuild;
	this.redraw = redraw;
	this.setPayload = setPayload;
	this.pan = pan;
	this.Timers = Timers;
	this.setTimeout = setTimeout;
	this.clientToDiagram = clientToDiagram;
	this.diagramToClient = diagramToClient
	this.toDiagram = toDiagram;
	this.incomingClick = incomingClick;

	this.scrollBy = scrollBy;
	this.finishScroll = finishScroll;

	this.zoomBy = zoomBy;
	this.finishZoom = finishZoom;
	this.zoomTo = zoomTo;
	this.zoomIn = zoomIn;
	this.zoomOut = zoomOut;
	this.getZoom = getZoom;
	this.zoomAt = zoomAt;
	this.getRetinaFactor = getRetinaFactor;

	this.showOver = showOver;
	this.hideOver = hideOver;
	this.selectBlock = selectBlock;

	this.mouseDown = mouseDown;
	this.mouseMove = mouseMove;
	this.mouseUp = mouseUp;
	this.setCursor = setCursor;
	this.getVisibleBox = getVisibleBox
}
