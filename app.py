from flask import Flask, render_template, request, jsonify
import requests


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/solve_maze', methods=['POST'])
def solve_maze():
    data = request.json
    response = requests.post(
        "https://europe-west1-swift-doodad-319113.cloudfunctions.net/find_path",
        json=data
    )
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)