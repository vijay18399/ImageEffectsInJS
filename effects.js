function applyEffect(imageData, effect, callback) {
    switch (effect) {
        case "Grayscale":
            applyGrayscale(imageData);
            break;
        case "Emboss":
            applyEmboss(imageData);
            break;
        case "Invert":
            applyInvert(imageData);
            break;
        case "Soften":
            applySoften(imageData);
            break;
        case "Dilate":
            applyDilate(imageData);
            break;
        case "Erode":
            applyErode(imageData);
            break;
        case "Sobel":
            applySobel(imageData);
            break
        case "EdgeDetection":
            applyEdgeDetection(imageData);
            break
        case "Blur":
            applyBlur(imageData);
            break
        case "Sharpen":
            applySharpen(imageData);
            break
        default:

            // No effect specified
            break;
    }

    callback(imageData);
}

function applyGrayscale(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
        var avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
    }
}


function applyInvert(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i];
        imageData.data[i + 1] = 255 - imageData.data[i + 1];
        imageData.data[i + 2] = 255 - imageData.data[i + 2];
    }
}

function applyEmboss(imageData) {
    var matrix = [
        [1, 1, 1],
        [1, 0.7, -1],
        [-1, -1, -1]
    ];
    convolute(matrix,imageData);

}



function applySoften(imageData) {
    var matrix = [
        1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9,
    ];

    for (var i = 0; i < imageData.data.length; i += 4) {
        var sumRed = 0, sumGreen = 0, sumBlue = 0;

        for (var j = 0; j < 9; j++) {
            var neighborIndex = i + (Math.floor(j / 3) - 1) * imageData.width * 4 + ((j % 3) - 1) * 4;

            sumRed += imageData.data[neighborIndex] * matrix[j];
            sumGreen += imageData.data[neighborIndex + 1] * matrix[j];
            sumBlue += imageData.data[neighborIndex + 2] * matrix[j];
        }

        imageData.data[i] = sumRed;
        imageData.data[i + 1] = sumGreen;
        imageData.data[i + 2] = sumBlue;
    }
}

function applyDilate(imageData) {
    var matrix = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ];
    convoluteMax(matrix, imageData);
}

function applyErode(imageData) {
    var matrix = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ];
    convoluteMin(matrix, imageData);
}

function convoluteMax(matrix, imageData) {
    var side = matrix.length;
    var halfSide = Math.floor(side / 2);

    var srcData = imageData.data.slice(); // Copy the original pixel data

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var dstOff = (y * imageData.width + x) * 4;
            var maxRed = 0, maxGreen = 0, maxBlue = 0;

            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(imageData.height - 1, Math.max(0, y + cy - halfSide));
                    var scx = Math.min(imageData.width - 1, Math.max(0, x + cx - halfSide));

                    var srcOff = (scy * imageData.width + scx) * 4;
                    var wt = matrix[cy][cx];

                    maxRed = Math.max(maxRed, srcData[srcOff]);
                    maxGreen = Math.max(maxGreen, srcData[srcOff + 1]);
                    maxBlue = Math.max(maxBlue, srcData[srcOff + 2]);
                }
            }

            imageData.data[dstOff] = maxRed;
            imageData.data[dstOff + 1] = maxGreen;
            imageData.data[dstOff + 2] = maxBlue;
        }
    }
}

function convoluteMin(matrix, imageData) {
    var side = matrix.length;
    var halfSide = Math.floor(side / 2);

    var srcData = imageData.data.slice(); // Copy the original pixel data

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var dstOff = (y * imageData.width + x) * 4;
            var minRed = 255, minGreen = 255, minBlue = 255;

            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(imageData.height - 1, Math.max(0, y + cy - halfSide));
                    var scx = Math.min(imageData.width - 1, Math.max(0, x + cx - halfSide));

                    var srcOff = (scy * imageData.width + scx) * 4;
                    var wt = matrix[cy][cx];

                    minRed = Math.min(minRed, srcData[srcOff]);
                    minGreen = Math.min(minGreen, srcData[srcOff + 1]);
                    minBlue = Math.min(minBlue, srcData[srcOff + 2]);
                }
            }

            imageData.data[dstOff] = minRed;
            imageData.data[dstOff + 1] = minGreen;
            imageData.data[dstOff + 2] = minBlue;
        }
    }
}

function convolute(matrix,imageData) {
    var side = matrix.length;
    var halfSide = Math.floor(side / 2);

    var srcData = imageData.data.slice(); // Copy the original pixel data

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var dstOff = (y * imageData.width + x) * 4;
            var sumRed = 0, sumGreen = 0, sumBlue = 0;

            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(imageData.height - 1, Math.max(0, y + cy - halfSide));
                    var scx = Math.min(imageData.width - 1, Math.max(0, x + cx - halfSide));

                    var srcOff = (scy * imageData.width + scx) * 4;
                    var wt = matrix[cy][cx];

                    sumRed += srcData[srcOff] * wt;
                    sumGreen += srcData[srcOff + 1] * wt;
                    sumBlue += srcData[srcOff + 2] * wt;
                }
            }

            imageData.data[dstOff] = sumRed;
            imageData.data[dstOff + 1] = sumGreen;
            imageData.data[dstOff + 2] = sumBlue;
        }
    }
}

function applyBlur(imageData) {
    var radius = 1; // You can adjust the radius for a stronger/weaker blur

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var dstOff = (y * imageData.width + x) * 4;
            var sumRed = 0, sumGreen = 0, sumBlue = 0, count = 0;

            for (var dy = -radius; dy <= radius; dy++) {
                for (var dx = -radius; dx <= radius; dx++) {
                    var scy = Math.min(imageData.height - 1, Math.max(0, y + dy));
                    var scx = Math.min(imageData.width - 1, Math.max(0, x + dx));

                    var srcOff = (scy * imageData.width + scx) * 4;

                    sumRed += imageData.data[srcOff];
                    sumGreen += imageData.data[srcOff + 1];
                    sumBlue += imageData.data[srcOff + 2];
                    count++;
                }
            }

            imageData.data[dstOff] = sumRed / count;
            imageData.data[dstOff + 1] = sumGreen / count;
            imageData.data[dstOff + 2] = sumBlue / count;
        }
    }
}


function applySharpen(imageData) {
    var matrix = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
    ];

    convolute(matrix, imageData);
}

function applyEdgeDetection(imageData) {
    var matrix = [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1],
    ];

    convolute(matrix, imageData);
}

function applySobel(imageData) {
    var matrixX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
    ];

    var matrixY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
    ];

    var tempData = new Uint8ClampedArray(imageData.data);

    convoluteSobel(matrixX, matrixY, tempData, imageData);
}

function convoluteSobel(matrixX, matrixY, tempData, imageData) {
    var side = matrixX.length;
    var halfSide = Math.floor(side / 2);

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var dstOff = (y * imageData.width + x) * 4;
            var sumXRed = 0, sumXGreen = 0, sumXBlue = 0;
            var sumYRed = 0, sumYGreen = 0, sumYBlue = 0;

            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(imageData.height - 1, Math.max(0, y + cy - halfSide));
                    var scx = Math.min(imageData.width - 1, Math.max(0, x + cx - halfSide));

                    var srcOff = (scy * imageData.width + scx) * 4;
                    var wtX = matrixX[cy][cx];
                    var wtY = matrixY[cy][cx];

                    sumXRed += tempData[srcOff] * wtX;
                    sumXGreen += tempData[srcOff + 1] * wtX;
                    sumXBlue += tempData[srcOff + 2] * wtX;

                    sumYRed += tempData[srcOff] * wtY;
                    sumYGreen += tempData[srcOff + 1] * wtY;
                    sumYBlue += tempData[srcOff + 2] * wtY;
                }
            }

            var finalX = Math.sqrt(sumXRed * sumXRed + sumXGreen * sumXGreen + sumXBlue * sumXBlue);
            var finalY = Math.sqrt(sumYRed * sumYRed + sumYGreen * sumYGreen + sumYBlue * sumYBlue);

            imageData.data[dstOff] = finalX > 255 ? 255 : finalX;
            imageData.data[dstOff + 1] = finalY > 255 ? 255 : finalY;
            imageData.data[dstOff + 2] = (finalX + finalY) / 2;
        }
    }
}
