var canvas = document.getElementById('board');

var aliveTable = [];
var columnNumber = 0;
var rowNumber = 0;
var currPosX = 0;
var currPosY = 0;
var triangleSideLength = 10;
var triangleHeight = triangleSideLength*Math.sqrt(3)/2;

var interval=null;

initializeBoard = () => {
	initAliveTable();
	drawBoard();
}
initAliveTable = () => {
	var columnNumberLoc = parseInt((1000 -triangleSideLength/2)/triangleSideLength );
	var rowNumberLoc = isOdd(parseInt((1000 /triangleHeight * 2)-1)) ? parseInt((1000 /triangleHeight * 2)) : parseInt((1000 /triangleHeight * 2)-1);
	columnNumber = columnNumberLoc;
	rowNumber = rowNumberLoc;
	for(let i=0 ; i<rowNumber ;i++){
		let colArr = [];
		for(let i=0 ; i<columnNumber ;i++){
			colArr.push(0);
		}
		aliveTable[i] = colArr;
	}
}
drawSingleTriangle = (alive) => {
    var ctx = canvas.getContext('2d');

	ctx.beginPath();
    ctx.moveTo(currPosX,currPosY);
    ctx.lineTo(currPosX+triangleSideLength,currPosY);
	ctx.lineTo(currPosX+triangleSideLength/2,currPosY+triangleHeight);
	if(alive===0){
		ctx.fillStyle = "#e6e6e6";
	}else{
		ctx.fillStyle = "#000000";
	}
    ctx.fill();
}
drawReverseTriangle = (alive) => {
    var ctx = canvas.getContext('2d');
	ctx.beginPath();
    ctx.moveTo(currPosX,currPosY);
    ctx.lineTo(currPosX+triangleSideLength,currPosY);
    ctx.lineTo(currPosX+triangleSideLength/2,currPosY-triangleHeight);
	if(alive===0){
		ctx.fillStyle = "#f2f2f2";
	}else{
		ctx.fillStyle = "#0d0d0d";
	}
	ctx.fill();
}
drawBoard = () => {
    var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	currPosX = 0;
	currPosY = 0;
	aliveTable.forEach((row,index) => {
		if(index%4===0){
			row.forEach((element,elementIndex) => {
				drawSingleTriangle(aliveTable[index][elementIndex]);
				currPosX += triangleSideLength;
			})
			currPosY += triangleHeight;
		}else if(index%4===1){
			currPosX += triangleSideLength/2;
			row.forEach((element,elementIndex) => {
				drawReverseTriangle(aliveTable[index][elementIndex]);
				currPosX += triangleSideLength;
			})
		}else if(index%4===2){
			currPosX += triangleSideLength/2;
			row.forEach((element,elementIndex) => {
				drawSingleTriangle(aliveTable[index][elementIndex]);
				currPosX += triangleSideLength;
			})
			currPosY += triangleHeight;
		}else if(index%4===3){
			row.forEach((element,elementIndex) => {
				drawReverseTriangle(aliveTable[index][elementIndex]);
				currPosX += triangleSideLength;
			})
		}
		currPosX = 0;
	})
}
isOdd = (num) => { 
	return num % 2;
}
applyInputs = () => {
	initAliveTable();
	let newDensity = parseInt(document.getElementById("density").value);

	if(newDensity > 0 && newDensity <= 100){
		if(newDensity === 100){
			aliveTable.forEach((row,index) => {
				row.forEach((element,elementIndex) => {
					aliveTable[index][elementIndex] = 1;
				})
			})
		}else{
			for(aliveFileds = 0; aliveFileds < newDensity*0.01*rowNumber*columnNumber;aliveFileds++){
				aliveRandomCell();
			}
		}
		drawBoard();
	}
	
}
aliveRandomCell = () => {
	let row = Math.floor((Math.random() * rowNumber));
	let col = Math.floor((Math.random() * columnNumber))
	if(aliveTable[row][col]===0)
		aliveTable[row][col] = 1;
	else
		aliveRandomCell();
}
startSimulation = () => { 
	interval = window.setInterval(() => {
		nextStep();
	}, 200);
}
stopSimulation = () => { 
	clearInterval(interval);
}
nextStep = () => { 
	let tmpAliveArr = [];
	for(let i=0 ; i<rowNumber ;i++){
		let colArr = [];
		for(let i=0 ; i<columnNumber ;i++){
			colArr.push(0);
		}
		tmpAliveArr[i] = colArr;
	}

	aliveTable.forEach((row,index) => {
		row.forEach((element,elementIndex) => {
			if(index %2==0){
				//Normal
				let neighboursCount = getNormalNeighboursCount(index,elementIndex);
				if(neighboursCount!==0){
					if(neighboursCount>1&&neighboursCount<3)
						tmpAliveArr[index][elementIndex] = 1;
				}
			}else{
				//Reverse
				let neighboursCount = getReverseNeighboursCount(index,elementIndex);
				if(neighboursCount!==0){
					if(neighboursCount>1&&neighboursCount<3)
						tmpAliveArr[index][elementIndex] = 1;
				}
			}
		})
	})
	aliveTable = tmpAliveArr;
	drawBoard();
}
getNormalNeighboursCount = (row,col) => {
	let neighboursCount = 0;
	let rm1 = row-1 >= 0 			? row-1 : rowNumber-1;
	let rp1 = row+1 < rowNumber 	? row+1 : 0;
	let rp3 = row+3 < rowNumber		? row+3 : (row-rowNumber)+3;
	let cm1 = col-1 >= 0 			? col-1 : columnNumber-1;
	let cp1 = col+1 < columnNumber 	? col+1 : 0;
	
	if(aliveTable[rm1][col]===1)
		++neighboursCount;
	if(aliveTable[rm1][cm1]===1)
		++neighboursCount;
	if(aliveTable[rm1][cp1]===1)
		++neighboursCount;
	if(aliveTable[rp1][cm1]===1)
		++neighboursCount;
	if(aliveTable[rp1][cp1]===1)
		++neighboursCount;
	if(aliveTable[rp3][col]===1)
		++neighboursCount;
	return neighboursCount;
}
getReverseNeighboursCount = (row,col) => {
	let neighboursCount = 0;
	let rm1 = row-1 >= 0 			? row-1 : rowNumber-1;
	let rp1 = row+1 < rowNumber 	? row+1 : 0;
	let rm3 = row-3 >= 0			? row-3 : rowNumber-(3-row);
	let cm1 = col-1 >= 0 			? col-1 : columnNumber-1;
	let cp1 = col+1 < columnNumber 	? col+1 : 0;
	
	if(aliveTable[rm3][col]===1)
		++neighboursCount;
	if(aliveTable[rm1][cm1]===1)
		++neighboursCount;
	if(aliveTable[rm1][cp1]===1)
		++neighboursCount;
	if(aliveTable[rp1][col]===1)
		++neighboursCount;
	if(aliveTable[rp1][cm1]===1)
		++neighboursCount;
	if(aliveTable[rp1][cp1]===1)
		++neighboursCount;
	return neighboursCount;
}