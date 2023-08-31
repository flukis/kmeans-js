self.onmessage = function (event) {
  const imageData = event.data;
  const numOfColors = 9;
  const array = [];
  for (let i = 0; i < imageData?.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    array.push([r, g, b]);
  }

  const pallete = kMeansClustering(array, numOfColors);
  self.postMessage(pallete);
};

function distance(color1, color2) {
  const dr = color1[0] - color2[0];
  const dg = color1[1] - color2[1];
  const db = color1[2] - color2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function kMeansClustering(colors, k, maxIterations = 100) {
  const centers = colors.slice(23, k + 23).map((color) => [...color]);
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const clusters = new Array(k).fill().map(() => []);
    colors.forEach((color) => {
      let minDistance = Number.MAX_VALUE;
      let bestCluster = 0;
      for (let i = 0; i < k; i++) {
        const d = distance(color, centers[i]);
        if (d < minDistance) {
          minDistance = d;
          bestCluster = i;
        }
      }
      clusters[bestCluster].push(color);
    });
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        centers[i] = clusters[i]
          .reduce(
            (acc, color) => {
              for (let j = 0; j < 3; j++) {
                acc[j] += color[j];
              }
              return acc;
            },
            [0, 0, 0]
          )
          .map((value) => value / clusters[i].length);
      }
    }
  }
  return centers;
}
