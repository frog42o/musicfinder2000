import { kmeans } from "ml-kmeans";


const extractFeatures = (track: any): number[] => [
  track.danceability,
  track.energy,
  track.loudness,
  track.speechiness,
  track.acousticness,
  track.instrumentalness,
  track.valence,
  track.tempo,
  track.key,
  track.liveness,
  track.duration_ms,
  track.time_signature,
];

export const kMeansAlgorithm = async(data:any[])=>{
      const features = data.map(extractFeatures);
      const optimalK = await runElbowMethod(features);
      //console.log("Optimal K:", optimalK);
      const model = kmeans(features, optimalK, {});
      //console.log("Cluster assignments:", model.clusters);
      //console.log("Centroids:", model.centroids);
    
      return model;
}

/*
    DETERMINES OPTIMAL K - CHAT GPT source 
*/
const runElbowMethod = async (data: number[][]): Promise<number> => {
    const maxClusters = 10;
    const inertias: number[] = [];
  
    for (let k = 1; k <= maxClusters; k++) {
        const result = kmeans(data, k, {});
        const inertia = data.reduce((sum, point, idx) => {
            const centroid = result.centroids[result.clusters[idx]];
            const squaredDistance = point.reduce((acc, val, i) => acc + (val - centroid[i]) ** 2,0);
            return sum + squaredDistance;
        }, 0);
        inertias.push(inertia); // Store the inertia for each k
      }
    
    // Find the optimal k using the "elbow" point
    const optimalK = findOptimalK(inertias);
    return optimalK;
  };
  
  const findOptimalK = (inertias: number[]): number => {
    // Implement logic to detect the "elbow" point
    // Here, we assume the optimal k is where the drop in inertia slows significantly
    for (let i = 1; i < inertias.length - 1; i++) {
      if (Math.abs(inertias[i] - inertias[i + 1]) < 0.1 * inertias[0]) {
        return i + 1; // Optimal k
      }
    }
    return inertias.length; // Default to maxClusters if no elbow point is clear
  };


  
  const predictCluster = (centroids: number[][], point: number[]): number => {
    let closestCluster = -1;
    let minDistance = Infinity;
  
    centroids.forEach((centroid, index) => {
      const distance = point.reduce((sum, value, i) => sum + (value - centroid[i]) ** 2, 0);
      if (distance < minDistance) {
        minDistance = distance;
        closestCluster = index;
      }
    });
  
    return closestCluster;
  };
  export const assignTracksToClusters = (tracks: any[], model: any) => {
    const clusterAssignments = tracks.map((track) => {
      const features = extractFeatures(track); 
      const cluster = predictCluster(model.centroids, features);
      return { track, cluster };
    });
  
    return clusterAssignments;
  };
  export const findDominantCluster = (playlistClusters: { track: any; cluster: number }[]) => {
    const clusterCounts: Record<number, number> = {};
  
    playlistClusters.forEach(({ cluster }) => {
      clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
    });
  
    const dominantCluster = Object.entries(clusterCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];
  
    return parseInt(dominantCluster, 10);
  };
  export const filterRecommendationsByCluster = (recommendations: any[], model: any, dominantCluster: number) => {
      if (!Array.isArray(recommendations)) {
        console.error("Recommendations is not an array:", recommendations);
        return [];
    }

    if (!model.centroids || !model.clusters) {
        console.error("KMeans model is invalid:", model);
        return [];
    }

    return recommendations.filter((track) => {
      const features = extractFeatures(track); 
      const cluster = predictCluster(model.centroids, features); 
      return cluster === dominantCluster;
    });
  };