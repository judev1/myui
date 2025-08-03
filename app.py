from flask import Flask, render_template, request
import json
import os

app = Flask(__name__)

app.template_folder = 'templates'
app.static_folder = 'static'

@app.route('/')
def main():
    return render_template('main.html')

@app.route('/page/<screen>')
def page(screen):
    path = os.path.join('screens', f'{screen}.json')
    if os.path.exists(path):
        with open(path, 'r') as f:
            data = json.load(f)
        return json.dumps(data)
    return 'Screen not found', 404

@app.route('/save/<screen>', methods=['POST'])
def save(screen):
    data = request.get_json()
    path = os.path.join('screens', f'{screen}.json')
    with open(path, 'w') as f:
        json.dump(data, f)
    return 'Screen saved successfully', 200


if __name__ == '__main__':
    app.run(debug=True)