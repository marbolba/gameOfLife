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
		for(let j=0 ; j<columnNumber ;j++){
			if(i<rowNumber/2 && j<columnNumber/2 )			//fract 1 
				colArr.push({alive:0,fraction:0});
			if(i<rowNumber/2 && j>=columnNumber/2 )			//fract 2 
				colArr.push({alive:0,fraction:1});
			if(i>=rowNumber/2 && j<columnNumber/2 )			//fract 3 
				colArr.push({alive:0,fraction:2});
			if(i>=rowNumber/2 && j>=columnNumber/2 )		//fract 4 
				colArr.push({alive:0,fraction:3});
		}
		aliveTable[i] = colArr;
	}
}
drawSingleTriangle = (individual) => {
    var ctx = canvas.getContext('2d');

	ctx.beginPath();
    ctx.moveTo(currPosX,currPosY);
    ctx.lineTo(currPosX+triangleSideLength,currPosY);
	ctx.lineTo(currPosX+triangleSideLength/2,currPosY+triangleHeight);
	if(individual.alive===1){
		if(individual.fraction === 0){
			//mozna porobic rozne kolorki dla atrakccyjnosci
			ctx.fillStyle = "#00ff00";
		}else if(individual.fraction === 1){
			ctx.fillStyle = "#000066";
		}else if(individual.fraction === 2){
			ctx.fillStyle = "#ff6600";
		}else if(individual.fraction === 3){
			ctx.fillStyle = "#996633";
		}
	}else{
		ctx.fillStyle = "#d9d9d9";
	}
    ctx.fill();
}
drawReverseTriangle = (individual) => {
    var ctx = canvas.getContext('2d');
	ctx.beginPath();
    ctx.moveTo(currPosX,currPosY);
    ctx.lineTo(currPosX+triangleSideLength,currPosY);
    ctx.lineTo(currPosX+triangleSideLength/2,currPosY-triangleHeight);
	if(individual.alive===1){
		if(individual.fraction === 0){
			//mozna porobic rozne kolorki dla atrakccyjnosci
			ctx.fillStyle = "#00ff00";
		}else if(individual.fraction === 1){
			ctx.fillStyle = "#000066";
		}else if(individual.fraction === 2){
			ctx.fillStyle = "#ff6600";
		}else if(individual.fraction === 3){
			ctx.fillStyle = "#996633";
		}
	}else{
		ctx.fillStyle = "#bfbfbf";
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
					aliveTable[index][elementIndex].alive = 1;
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
	if(aliveTable[row][col].alive===0)
		aliveTable[row][col].alive = 1;
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
		for(let j=0 ; j<columnNumber ;j++){
			if(i<rowNumber/2 && j<columnNumber/2 )			//fract 1 
				colArr.push({alive:0,fraction:0});
			if(i<rowNumber/2 && j>=columnNumber/2 )			//fract 2 
				colArr.push({alive:0,fraction:1});
			if(i>=rowNumber/2 && j<columnNumber/2 )			//fract 3 
				colArr.push({alive:0,fraction:2});
			if(i>=rowNumber/2 && j>=columnNumber/2 )		//fract 4 
				colArr.push({alive:0,fraction:3});
			}
		tmpAliveArr[i] = colArr;
	}
//ZASADY ZYCIA I SMIERCI
	let counter = 0;
	aliveTable.forEach((row,index) => {
		row.forEach((element,elementIndex) => {	
			if(index %2==0){
				//Normal
				let neighboursInfo = getNormalNeighboursCount(index,elementIndex);
				if(neighboursInfo.count!==0){
					if(neighboursInfo.count>1&&neighboursInfo.count<3)
						tmpAliveArr[index][elementIndex].alive = 1;
						tmpAliveArr[index][elementIndex].fraction = (neighboursInfo.nextFractionNr !== -1 ? neighboursInfo.nextFractionNr : element.fraction);
				}
				++counter;
			}else{
				//Reverse
				let neighboursInfo = getReverseNeighboursCount(index,elementIndex);
				if(neighboursInfo.count!==0){
					if(neighboursInfo.count>1&&neighboursInfo.count<3)
						tmpAliveArr[index][elementIndex].alive = 1;
						tmpAliveArr[index][elementIndex].fraction = (neighboursInfo.nextFractionNr !== -1 ? neighboursInfo.nextFractionNr : element.fraction);
				}
				++counter;
			}
		})
	})
	aliveTable = tmpAliveArr;
	drawBoard();
}
getNormalNeighboursCount = (row,col) => {
	let neighboursInfo = {count:0,fraction:[0,0,0,0],nextFractionNr:-1};
	let rm1 = row-1 >= 0 			? row-1 : rowNumber-1;
	let rp1 = row+1 < rowNumber 	? row+1 : 0;
	let rp3 = row+3 < rowNumber		? row+3 : (row-rowNumber)+3;
	let cm1 = col-1 >= 0 			? col-1 : columnNumber-1;
	let cp1 = col+1 < columnNumber 	? col+1 : 0;
	let currCellFraction = aliveTable[row][col].fraction;


	//wypelnienie obiektu neigoburs info, tablica mowi o czlonkach konktretnej frakcji
	conditionIf(rm1,col,neighboursInfo,currCellFraction);
	conditionIf(rm1,cm1,neighboursInfo,currCellFraction);
	conditionIf(rm1,cp1,neighboursInfo,currCellFraction);
	conditionIf(rp1,cm1,neighboursInfo,currCellFraction);
	conditionIf(rp1,cp1,neighboursInfo,currCellFraction);
	conditionIf(rp3,col,neighboursInfo,currCellFraction);

	let indexOfNextFraction = indexOfMax(neighboursInfo.fraction);
		neighboursInfo.nextFractionNr = indexOfNextFraction;
	return neighboursInfo;
}
getReverseNeighboursCount = (row,col) => {
	let neighboursInfo = {count:0,fraction:[0,0,0,0],nextFractionNr:-1};
	let rm1 = row-1 >= 0 			? row-1 : rowNumber-1;
	let rp1 = row+1 < rowNumber 	? row+1 : 0;
	let rm3 = row-3 >= 0			? row-3 : rowNumber-(3-row);
	let cm1 = col-1 >= 0 			? col-1 : columnNumber-1;
	let cp1 = col+1 < columnNumber 	? col+1 : 0;
	let currCellFraction = aliveTable[row][col].fraction;

	conditionIf(rp1,col,neighboursInfo,currCellFraction);
	conditionIf(rp1,cm1,neighboursInfo,currCellFraction);
	conditionIf(rp1,cp1,neighboursInfo,currCellFraction);
	conditionIf(rm3,col,neighboursInfo,currCellFraction);
	conditionIf(rm1,cm1,neighboursInfo,currCellFraction);
	conditionIf(rm1,cp1,neighboursInfo,currCellFraction);

	let indexOfNextFraction = indexOfMax(neighboursInfo.fraction);
	if(indexOfNextFraction !== -1)
		neighboursInfo.nextFractionNr = indexOfNextFraction;
	return neighboursInfo;
}
conditionIf = (row,column,neighboursInfo,currCellFraction) => {
	if(aliveTable[row][column].alive === 1){
		++neighboursInfo.count;
		if(aliveTable[row][column].fraction === currCellFraction){
			++neighboursInfo.fraction[currCellFraction];
		}else{
			++neighboursInfo.fraction[aliveTable[row][column].fraction];
		}
	}
}
indexOfMax = (arr) => {
    if (arr.length === 0) {
        return -1;
	}
    var max = 0;
    var maxIndex = -1;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] >= max) {
			if(arr[i] === max){
				maxIndex = -1;
			}else{
				maxIndex = i;
				max = arr[i];
			}
        }
    }
    return maxIndex;
}