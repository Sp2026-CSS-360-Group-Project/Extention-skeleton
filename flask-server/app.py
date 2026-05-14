from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return "<h1>FocusKit Flask Server is running</h1>"


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "focuskit-flask-server"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
