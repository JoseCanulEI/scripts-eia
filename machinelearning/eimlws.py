from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from sklearn import cluster, mixture
from sklearn.neighbors import kneighbors_graph
from sklearn.preprocessing import StandardScaler, RobustScaler
import pickle
import base64

app = Flask(__name__)
CORS(app)

MAX_BIRCH_CLUSTERS = 30

@app.route('/clusterize', methods=['POST'])
def clusterize():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    return startProcess(data)


def startProcess(request_data):
    X = np.array(request_data['data'])
    params = request_data.get('params', {})
    algo = request_data.get('algo', '').lower()
    model_base64 = request_data.get('model', None)
    workflow = request_data.get('workflow', None)

    initial_model = None
    initial_scalers = None
    if model_base64:
        try:
            model_bytes = base64.b64decode(model_base64)
            model_dict = pickle.loads(model_bytes)
            initial_model = model_dict["model"]
            initial_scalers = model_dict["scalers"]
        except Exception as e:
            return jsonify({"error": f"Failed to load provided model: {str(e)}"}), 400

    # ✅ Declare shared variables for both branches
    full_labels = []
    current_model = None
    col_scalers = {}

    if workflow:
        learning = workflow.get("learning", {})
        post_learning = workflow.get("postLearning", {})

        start_idx = learning.get("startIndex", 0)
        end_idx = learning.get("endIndex", len(X))
        direction = post_learning.get("direction", "asc")
        batch_size = post_learning.get("batch", 1)

        # Phase 1: Learn on training window
        X_learning = X[start_idx:end_idx]
        result_learning = run_clustering(X_learning, params, algo, None, None)
        if "error" in result_learning:
            return jsonify(result_learning), 400

        labels_learning = result_learning["clusters"]
        current_model = result_learning["model"]
        col_scalers = result_learning["scalers"]

        # Phase 2: Apply post-learning in batches
        indices_rest = [i for i in range(len(X)) if not (start_idx <= i < end_idx)]
        if direction == "desc":
            indices_rest = list(reversed(indices_rest))

        labels_rest = [None] * len(X)
        for i in range(0, len(indices_rest), batch_size):
            batch_indices = indices_rest[i:i + batch_size]
            X_batch = X[batch_indices]

            result_batch = run_clustering(X_batch, params, algo, current_model, col_scalers)
            if "error" in result_batch:
                return jsonify(result_batch), 400

            for j, idx in enumerate(batch_indices):
                labels_rest[idx] = result_batch["clusters"][j]

            current_model = result_batch["model"]

        # Combine labels
        full_labels = [None] * len(X)
        for i in range(start_idx, end_idx):
            full_labels[i] = labels_learning[i - start_idx]
        for i in indices_rest:
            full_labels[i] = labels_rest[i]

    else:
        result = run_clustering(X, params, algo, initial_model, initial_scalers)
        if "error" in result:
            return jsonify(result), 400
        full_labels = result["clusters"]
        current_model = result["model"]
        col_scalers = result["scalers"]

    # ✅ Final model serialization done once
    model_dict = {
        "model": current_model,
        "scalers": col_scalers
    }
    model_bytes = pickle.dumps(model_dict)
    updated_model_base64 = base64.b64encode(model_bytes).decode('utf-8')

    return jsonify({
        "clusters": full_labels,
        "model": updated_model_base64
    }), 201



def run_clustering(X, params, algo, model=None, col_scalers=None):
    try:
        if model:
            clustering = model

            for col_index, scaler_info in col_scalers.items():
                scaler = scaler_info["scaler"]
                weight = scaler_info["weight"]
                col_data = X[:, col_index].reshape(-1, 1)
                if scaler:
                    col_data = scaler.transform(col_data) * weight
                    X[:, col_index] = col_data.flatten()

            if hasattr(clustering, 'partial_fit'):
                clustering.partial_fit(X)

            if hasattr(clustering, 'predict'):
                labels = clustering.predict(X)
            elif hasattr(clustering, 'labels_'):
                labels = clustering.labels_
            else:
                return {"error": "Clustering algorithm did not produce labels"}
            labels = labels.tolist()

        else:
            col_scalers = {}
            scaling_instructions = params.get("scaling", [])
            X_scaled = X.copy()

            for scale_info in scaling_instructions:
                col_index = scale_info["index"]
                scale_type = scale_info.get("type", "none").lower()
                weight = scale_info.get("weight", 1.0)
                col_data = X_scaled[:, col_index].reshape(-1, 1)

                if scale_type == "standard":
                    scaler = StandardScaler()
                    col_data = scaler.fit_transform(col_data)
                elif scale_type == "robust":
                    scaler = RobustScaler()
                    col_data = scaler.fit_transform(col_data)
                elif scale_type == "none":
                    scaler = None
                else:
                    return {"error": f"Unknown scale type: {scale_type}"}

                col_data = col_data * weight
                X_scaled[:, col_index] = col_data.flatten()
                col_scalers[col_index] = {"scaler": scaler, "weight": weight}

            X = X_scaled
            connectivity = None
            if X.shape[0] > 1:
                connectivity = kneighbors_graph(X, n_neighbors=params.get("n_neighbors", 3), include_self=False)
                connectivity = 0.5 * (connectivity + connectivity.T)

            if algo == "meanshift":
                bandwidth = cluster.estimate_bandwidth(X, quantile=params.get("quantile", 0.3))
                clustering = cluster.MeanShift(bandwidth=bandwidth, bin_seeding=True).fit(X)
            elif algo == "spectralclustering":
                clustering = cluster.SpectralClustering(
                    n_clusters=params.get("n_clusters", 6),
                    eigen_solver="arpack",
                    affinity="nearest_neighbors",
                    n_neighbors=params.get("n_neighbors", 10),
                    random_state=params.get("random_state", 42)
                ).fit(X)
            elif algo == "agglomerative":
                clustering = cluster.AgglomerativeClustering(
                    n_clusters=params.get("n_clusters", 6),
                    linkage="ward"
                ).fit(X)
            elif algo == "dbscan":
                clustering = cluster.DBSCAN(eps=params.get("eps", 0.3)).fit(X)
            elif algo == "hdbscan":
                clustering = cluster.HDBSCAN(
                    min_samples=params.get("hdbscan_min_samples", 3),
                    min_cluster_size=params.get("hdbscan_min_cluster_size", 15),
                    allow_single_cluster=params.get("allow_single_cluster", True)
                ).fit(X)
            elif algo == "optics":
                clustering = cluster.OPTICS(
                    min_samples=params.get("min_samples", 7),
                    xi=params.get("xi", 0.05),
                    min_cluster_size=params.get("min_cluster_size", 0.1)
                ).fit(X)
            elif algo == "affinitypropagation":
                clustering = cluster.AffinityPropagation(
                    damping=params.get("damping", 0.9),
                    preference=params.get("preference", -200),
                    random_state=params.get("random_state", 42)
                ).fit(X)
            elif algo == "birch":
                birch_cluster = cluster.Birch(
                    n_clusters=params.get("n_clusters", None),
                    threshold=params.get("threshold", 0.5),
                    branching_factor=params.get("branching_factor", 50)
                ).fit(X)
                if len(np.unique(birch_cluster.labels_)) > MAX_BIRCH_CLUSTERS:
                    birch_cluster = cluster.Birch(
                        n_clusters=MAX_BIRCH_CLUSTERS,
                        threshold=params.get("threshold", 0.5),
                        branching_factor=params.get("branching_factor", 50)
                    ).fit(X)
                clustering = birch_cluster
            elif algo == "gaussianmixture":
                clustering = mixture.GaussianMixture(
                    n_components=params.get("n_clusters", 6),
                    covariance_type=params.get("covariance_type", "full"),
                    random_state=params.get("random_state", 42)
                ).fit(X)
            elif algo == "kmeans":
                clustering = cluster.KMeans(
                    n_clusters=params.get("n_clusters", 6),
                    random_state=params.get("random_state", 42)
                ).fit(X)
            elif algo == "minibatchkmeans":
                clustering = cluster.MiniBatchKMeans(
                    n_clusters=params.get("n_clusters", 6),
                    random_state=params.get("random_state", 42)
                ).fit(X)
            else:
                return {"error": "Unknown clustering algorithm"}

            if hasattr(clustering, 'labels_'):
                labels = clustering.labels_
            elif hasattr(clustering, 'predict'):
                labels = clustering.predict(X)
            else:
                return {"error": "Clustering algorithm did not produce labels"}

        labels = [int(lbl + 1) if lbl >= 0 else int(lbl) for lbl in labels]

        return {
            "clusters": labels,
            "model": clustering,
            "scalers": col_scalers
        }

    except Exception as e:
        return {"error": f"Clustering failed: {str(e)}"}


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


if __name__ == '__main__':
    app.run(debug=True, port=7676)

