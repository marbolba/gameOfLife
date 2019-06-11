var canvas = document.getElementById('board');

var aliveCountHistory = [];
var aliveCountHistoryWithFractions = [[],[],[],[]];
var chart ;

//game settings
var fractionMode = false;
var Bval = [];
var Sval = [];

var aliveTable = [];
var columnNumber = 0;
var rowNumber = 0;
var currPosX = 0;
var currPosY = 0;

//map sizing
var mapSize = 700;
var triangleSideLength = 10;
var triangleHeight = triangleSideLength*Math.sqrt(3)/2;

var interval=null;

initializeBoard = () => {
	initAliveTable();
	drawBoard();
	renderChart();
}
initAliveTable = () => {
	var columnNumberLoc = parseInt((mapSize -triangleSideLength/2)/triangleSideLength );
	var rowNumberLoc = isOdd(parseInt((mapSize /triangleHeight * 2)-1)) ? parseInt((mapSize /triangleHeight * 2)) : parseInt((mapSize /triangleHeight * 2)-1);
	columnNumber = columnNumberLoc;
	rowNumber = rowNumberLoc;
	aliveTable = getEmptyAliveTable(rowNumber,columnNumber);
}
getEmptyAliveTable = (rowNumber,columnNumber) => {
	var tmpAliveTable = [];
	for(let i=0 ; i<rowNumber ;i++){
		let colArr = [];
		for(let j=0 ; j<columnNumber ;j++){
			if(!fractionMode){
				colArr.push({alive:0});
			}else{
				if(i<rowNumber/2 && j<columnNumber/2 )			//fract 1 
					colArr.push({alive:0,fraction:0});
				if(i<rowNumber/2 && j>=columnNumber/2 )			//fract 2 
					colArr.push({alive:0,fraction:1});
				if(i>=rowNumber/2 && j<columnNumber/2 )			//fract 3 
					colArr.push({alive:0,fraction:2});
				if(i>=rowNumber/2 && j>=columnNumber/2 )		//fract 4 
					colArr.push({alive:0,fraction:3});
			}
		}
		tmpAliveTable[i] = colArr;
	}
	return tmpAliveTable;
}
drawSingleTriangle = (individual) => {
    var ctx = canvas.getContext('2d');
	ctx.beginPath();
    ctx.moveTo(currPosX,currPosY);
    ctx.lineTo(currPosX+triangleSideLength,currPosY);
	ctx.lineTo(currPosX+triangleSideLength/2,currPosY+triangleHeight);
	
	if(!fractionMode){
		if(individual.alive===1){
			ctx.fillStyle = "#000066";
		}else{
			ctx.fillStyle = "#d9d9d9";
		}
	}else{
		if(individual.alive===1){
			if(individual.fraction === 0){
				ctx.fillStyle = "#00ff00";
			}else if(individual.fraction === 1){
				ctx.fillStyle = "#000066";
			}else if(individual.fraction === 2){
				ctx.fillStyle = "#996633";
			}else if(individual.fraction === 3){
				ctx.fillStyle = "#ff6600";
			}
		}else{
			ctx.fillStyle = "#d9d9d9";
		}
	}
    ctx.fill();
}
drawReverseTriangle = (individual) => {
    var ctx = canvas.getContext('2d');
	ctx.beginPath();
    ctx.moveTo(currPosX,currPosY);
    ctx.lineTo(currPosX+triangleSideLength,currPosY);
	ctx.lineTo(currPosX+triangleSideLength/2,currPosY-triangleHeight);
	
	if(!fractionMode){
		if(individual.alive===1){
			ctx.fillStyle = "#000066";
		}else{
			ctx.fillStyle = "#bfbfbf";
		}
	}else{
		if(individual.alive===1){
			if(individual.fraction === 0){
				ctx.fillStyle = "#00ff00";
			}else if(individual.fraction === 1){
				ctx.fillStyle = "#000066";
			}else if(individual.fraction === 2){
				ctx.fillStyle = "#996633";
			}else if(individual.fraction === 3){
				ctx.fillStyle = "#ff6600";
			}
		}else{
			ctx.fillStyle = "#bfbfbf";
		}
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
	//set B and S values
	if(document.getElementById("Bval").value!=="")
		Bval = document.getElementById("Bval").value.split(',').map(Number)
	else
		Bval.length = 0
	if(document.getElementById("Sval").value!=="")
		Sval = document.getElementById("Sval").value.split(',').map(Number)
	else
		Sval.length = 0

	//set density
	let newDensity = parseInt(document.getElementById("density").value);
	
	//set fracton mode and it's chart
	fractionMode = Boolean(document.querySelector('input[name="fraction"]:checked').value);
	renderChart();
	
	initAliveTable();
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
	let tmpAliveArr = getEmptyAliveTable(rowNumber,columnNumber);

	//Count alive elements
	if(!fractionMode){
		let counter = 0;
		aliveTable.forEach((row) => {
			row.forEach((element) => {
				if(element.alive===1){
					++counter;
				}
			})
		})
		aliveCountHistory.push({x: aliveCountHistory.length, y: counter/(aliveTable.length*aliveTable[0].length)});
	}else{
		let counter0 = 0;
		let counter1 = 0;
		let counter2 = 0;
		let counter3 = 0;
		aliveTable.forEach((row) => {
			row.forEach((element) => {
				if(element.alive===1){
					if(element.fraction === 0){
						++counter0;
					}else if(element.fraction === 1){
						++counter1;
					}else if(element.fraction === 2){
						++counter2;
					}else if(element.fraction === 3){
						++counter3;
					}
				}
			})
		})
		aliveCountHistoryWithFractions[0].push({x: aliveCountHistoryWithFractions[0].length, y: counter0/(aliveTable.length*aliveTable[0].length)});
		aliveCountHistoryWithFractions[1].push({x: aliveCountHistoryWithFractions[1].length, y: counter1/(aliveTable.length*aliveTable[0].length)});
		aliveCountHistoryWithFractions[2].push({x: aliveCountHistoryWithFractions[2].length, y: counter2/(aliveTable.length*aliveTable[0].length)});
		aliveCountHistoryWithFractions[3].push({x: aliveCountHistoryWithFractions[3].length, y: counter3/(aliveTable.length*aliveTable[0].length)});
	}
	chart.render();

	//ZASADY ZYCIA I SMIERCI
	if(!fractionMode){
		aliveTable.forEach((row,index) => {
			row.forEach((element,elementIndex) => {	
				let neighboursInfo = null;
				if(index %2==0){	//normal
					neighboursInfo = getNormalNeighboursCount(index,elementIndex);
				}else{				//reverse
					neighboursInfo = getReverseNeighboursCount(index,elementIndex);
				}
				if(neighboursInfo.count!==0){
					if(element.alive===1){	//check stay
						Sval.forEach(stayVal => {
							if(neighboursInfo.count === stayVal){
								tmpAliveArr[index][elementIndex].alive = 1;
							}
						});
					}else{					//check Born
						Bval.forEach(bornVal => {
							if(neighboursInfo.count === bornVal){
								tmpAliveArr[index][elementIndex].alive = 1;
							}
						});
					}
				}
			})
		})
		aliveTable = tmpAliveArr;
	}else{
		aliveTable.forEach((row,index) => {
			row.forEach((element,elementIndex) => {	
				if(index %2==0){	//normal
					neighboursInfo = getNormalNeighboursCount(index,elementIndex);
				}else{				//reverse
					neighboursInfo = getReverseNeighboursCount(index,elementIndex);
				}
				if(neighboursInfo.count!==0){
					if(element.alive===1){	//check stay
						Sval.forEach(stayVal => {
							if(neighboursInfo.count === stayVal){
								if(neighboursInfo.nextFractionNr !== -1){
									tmpAliveArr[index][elementIndex].alive = 1;
									tmpAliveArr[index][elementIndex].fraction = neighboursInfo.nextFractionNr;
								}
							}
						});
					}else{					//check Born
						Bval.forEach(bornVal => {
							if(neighboursInfo.count === bornVal){
								if(neighboursInfo.nextFractionNr !== -1){
									tmpAliveArr[index][elementIndex].alive = 1;
									tmpAliveArr[index][elementIndex].fraction = neighboursInfo.nextFractionNr;
								}
							}
						});
					}
				}
			})
		})
		aliveTable = tmpAliveArr;
	}
	drawBoard();
}
getNormalNeighboursCount = (row,col) => {
	let rm1 = row-1 >= 0 			? row-1 : rowNumber-1;
	let rp1 = row+1 < rowNumber 	? row+1 : 0;
	let rp3 = row+3 < rowNumber		? row+3 : (row-rowNumber)+3;
	let cm1 = col-1 >= 0 			? col-1 : columnNumber-1;
	let cp1 = col+1 < columnNumber 	? col+1 : 0;
	
	let neighboursInfo = {count:0,fraction:[0,0,0,0],nextFractionNr:-1};
	if(!fractionMode){
		conditionIf(rm1,col,neighboursInfo);
		conditionIf(rm1,cm1,neighboursInfo);
		conditionIf(rm1,cp1,neighboursInfo);
		conditionIf(rp1,cm1,neighboursInfo);
		conditionIf(rp1,cp1,neighboursInfo);
		conditionIf(rp3,col,neighboursInfo);
	}else{
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
	}
	return neighboursInfo;
}
getReverseNeighboursCount = (row,col) => {
	let rm1 = row-1 >= 0 			? row-1 : rowNumber-1;
	let rp1 = row+1 < rowNumber 	? row+1 : 0;
	let rm3 = row-3 >= 0			? row-3 : rowNumber-(3-row);
	let cm1 = col-1 >= 0 			? col-1 : columnNumber-1;
	let cp1 = col+1 < columnNumber 	? col+1 : 0;

	let neighboursInfo = {count:0,fraction:[0,0,0,0],nextFractionNr:-1};
	if(!fractionMode){
		conditionIf(rp1,col,neighboursInfo);
		conditionIf(rp1,cm1,neighboursInfo);
		conditionIf(rp1,cp1,neighboursInfo);
		conditionIf(rm3,col,neighboursInfo);
		conditionIf(rm1,cm1,neighboursInfo);
		conditionIf(rm1,cp1,neighboursInfo);
	}else{
		let currCellFraction = aliveTable[row][col].fraction;
	
		conditionIf(rp1,col,neighboursInfo,currCellFraction);
		conditionIf(rp1,cm1,neighboursInfo,currCellFraction);
		conditionIf(rp1,cp1,neighboursInfo,currCellFraction);
		conditionIf(rm3,col,neighboursInfo,currCellFraction);
		conditionIf(rm1,cm1,neighboursInfo,currCellFraction);
		conditionIf(rm1,cp1,neighboursInfo,currCellFraction);

		let indexOfNextFraction = indexOfMax(neighboursInfo.fraction);
		neighboursInfo.nextFractionNr = indexOfNextFraction;
	}
	return neighboursInfo;
}
renderChart = () => {
	if(!fractionMode){
		chart = new CanvasJS.Chart("chartContainer", {
			theme: "light2",
			title: {
				text: "Wykres gęstości populacji w funkcji czasu"
			},
			axisX: {
				title: "t"
			},
			axisY: {
				title: "Populacja"
			},
			data: [{
				type: "line",
				dataPoints: aliveCountHistory,
				color: "#000066"
			}]
		});
	}else{
		chart = new CanvasJS.Chart("chartContainer", {
			theme: "light2",
			title: {
				text: "Wykres gęstości populacji frakcji w funkcji czasu"
			},
			axisX: {
				title: "t"
			},
			axisY: {
				title: "Populacja"
			},
			data: [{
				type: "line",
				dataPoints: aliveCountHistoryWithFractions[0],
				color: "#00ff00"
			},{
				type: "line",
				dataPoints: aliveCountHistoryWithFractions[1],
				color: "#000066"
			},{
				type: "line",
				dataPoints: aliveCountHistoryWithFractions[2],
				color: "#996633"
			},{
				type: "line",
				dataPoints: aliveCountHistoryWithFractions[3],
				color: "#ff6600"
			}]
		});
	}
	aliveCountHistory.length = 0;
	aliveCountHistoryWithFractions[0].length = 0;
	aliveCountHistoryWithFractions[1].length = 0;
	aliveCountHistoryWithFractions[2].length = 0;
	aliveCountHistoryWithFractions[3].length = 0;
	chart.render();
}
conditionIf = (row,column,neighboursInfo,currCellFraction) => {
	if(aliveTable[row][column].alive === 1){
		++neighboursInfo.count;
		if(fractionMode){
			if(aliveTable[row][column].fraction === currCellFraction){
				++neighboursInfo.fraction[currCellFraction];
			}else{
				++neighboursInfo.fraction[aliveTable[row][column].fraction];
			}
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